const results = document.getElementById("results");
const loader = document.getElementById("loader");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const categoryFilter = document.getElementById("categoryFilter");

document.getElementById("searchBtn").onclick = searchRecipes;
document.getElementById("favoritesBtn").onclick = showFavorites;
document.getElementById("themeToggle").onclick = toggleTheme;
document.getElementById("randomBtn").onclick = randomRecipe;
document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");
window.onclick = (e) => { if(e.target===modal) modal.classList.add("hidden"); };
document.addEventListener("keydown", e=>{ if(e.key==="Escape") modal.classList.add("hidden"); });

/* THEME */
function toggleTheme() { document.body.classList.toggle("dark"); }

/* LOADER */
const showLoader = ()=>loader.classList.remove("hidden");
const hideLoader = ()=>loader.classList.add("hidden");

/* LOAD CATEGORIES */
fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list")
.then(r=>r.json())
.then(data=>{
    data.meals.forEach(cat=>{
        const o=document.createElement("option");
        o.value=cat.strCategory;
        o.textContent=cat.strCategory;
        categoryFilter.appendChild(o);
    });
});

/* SEARCH */
function searchRecipes() {
    const q=document.getElementById("searchInput").value.trim();
    const cat=categoryFilter.value;
    let url=q?`https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`:`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`;

    showLoader();
    results.innerHTML="";

    fetch(url)
    .then(r=>r.json())
    .then(data=>{
        hideLoader();
        if(!data.meals) return results.innerHTML="<p>No recipes found.</p>";
        data.meals.forEach(m=>renderCard(m));
    });
}

/* RANDOM RECIPE */
function randomRecipe() {
    showLoader(); results.innerHTML="";
    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
    .then(r=>r.json())
    .then(data=>{
        hideLoader();
        renderCard(data.meals[0]);
    });
}

/* RENDER CARD */
function renderCard(meal) {
    const favs=JSON.parse(localStorage.getItem("favs"))||[];
    const isFav=favs.some(f=>f.id===meal.idMeal);
    const card=document.createElement("div");
    card.className="card";

    card.innerHTML=`
        <img src="${meal.strMealThumb}">
        <div class="card-body">
            <h3>${meal.strMeal}</h3>
            <div class="card-buttons">
                <button onclick="viewRecipe('${meal.idMeal}')">View</button>
                <button onclick="toggleFav('${meal.idMeal}','${meal.strMeal}','${meal.strMealThumb}')">
                    ${isFav?'💔':'❤️'}
                </button>
            </div>
        </div>
    `;
    results.appendChild(card);
}

/* VIEW RECIPE */
function viewRecipe(id){
    showLoader();
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(r=>r.json())
    .then(data=>{
        hideLoader();
        const m=data.meals[0];
        let ingredients="";
        for(let i=1;i<=20;i++){
            const ing=m[`strIngredient${i}`];
            const mea=m[`strMeasure${i}`];
            if(ing) ingredients+=`<li>${ing} - ${mea}</li>`;
        }
        modalBody.innerHTML=`
            <h2>${m.strMeal}</h2>
            <img src="${m.strMealThumb}" style="width:100%; border-radius:12px; margin:12px 0;">
            <h3>Ingredients</h3><ul>${ingredients}</ul>
            <h3>Instructions</h3><p>${m.strInstructions}</p>
        `;
        modal.classList.remove("hidden");
    });
}

/* FAVORITES */
function toggleFav(id,name,img){
    let favs=JSON.parse(localStorage.getItem("favs"))||[];
    if(favs.some(f=>f.id===id)){
        favs=favs.filter(f=>f.id!==id);
    }else{
        favs.push({id,name,img});
    }
    localStorage.setItem("favs",JSON.stringify(favs));
    searchRecipes(); // refresh cards to update ❤️/💔
}

function showFavorites(){
    results.innerHTML="";
    const favs=JSON.parse(localStorage.getItem("favs"))||[];
    if(favs.length===0) return results.innerHTML="<p>No favorites saved.</p>";
    favs.forEach(f=>renderCard({idMeal:f.id,strMeal:f.name,strMealThumb:f.img}));
}
