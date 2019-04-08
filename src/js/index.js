// Global app controller
// import num from './test';
// const x = 23;
// console.log(`call ${num} test. Var x is ${x}`);

// import string from './models/Search';
// // import {add as a, multiply as m, ID} from './views/searchView';
// import * as searchView from './views/searchView';

// console.log(string);
// console.log(searchView.ID);
// console.log(`${searchView.add(searchView.ID, 2)} and ${searchView.multiply(3, 5)}. ${string}`);
// 1b6ecef3782558cfb8afebecff0e7125
// https://www.food2fork.com/api/search?key=YOUR_API_KEY&q=chicken%20breast&page=2

import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import Recipe from './models/Recipe';
import {elements, renderLoader, clearLoader} from './views/base';
import List from './models/List';
import Likes from './models/Likes';
/** Global state of the app
 * - search obj
 * - current recipe object
 * - shopping list object
 * - liked recipes
 */
const state = {};
// window.state = state;


/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1. get query from view
    const query = searchView.getInput();
    // const query = 'pizza';

    if (query) {
        // 2. new search object and add to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4. Search for recipes
            await state.search.getResults(); //await since we need to wait whether there is result or not
            
            // 5. render results on UI
            // console.log(state.search.result); 
            clearLoader();
            searchView.renderResults(state.search.result);
        }
        catch(err) {
            alert('St is wrong...');
            clearLoader();
        }
        
    }   

}

elements.searchForm.addEventListener('submit', event => {
    event.preventDefault(); // for prevent blank input
    controlSearch();
});

// // TESTING
// window.addEventListener('load', event => {
//     event.preventDefault(); // for prevent blank input
//     controlSearch();
// });


elements.searchResPages.addEventListener('click', event => {
    // will find closest element ancestor that matches .btn-inline
    const btn = event.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    // get ID from url
    const id = window.location.hash.replace('#', '');
    
    if (id) {
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) {
            searchView.highlightSelected(id);
        }
        

        // create new recipe obj
        state.recipe = new Recipe(id);

        // //TESTING
        // window.r = state.recipe;

        try {
            await state.recipe.getRecipe(); // await to load data in background
            state.recipe.parseIngredients();
            // call calcTime & calcServing
            state.recipe.calcTime();
            state.recipe.calcServings();

            // render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
            }
            // get recipe data
        catch (err) {
            alert('Error processing recipe');
        }
        
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe)); 

/**
 * LIST CONTROLLER
 */
const controlList = () => {
    // create a new list IF there is none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

//Handle delete and update list item events
elements.shopping.addEventListener('click', event => {
    const id = event.target.closest('.shopping__item').dataset.itemid;

    // handle delete button
    if (event.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);
    }
    //handle count update
    else if (event.target.matches('.shopping__count-value')) {
        const val = parseFloat(event.target.value, 10);
        state.list.updateCount(id, val);
    }
});


/**
 * LIKE CONTROLLER
 */



const controlLike = () => {
    
    if (!state.likes) state.likes = new Likes();
    
    const currentID = state.recipe.id;
    
    // User has not yet liked current recipe
    if(!state.likes.isLiked(currentID)) {
        //Add like to state
        const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);
        //Toggle like button
        likesView.toggleLikeBtn(true);
        //add like to UI list
        likesView.renderLike(newLike);
    } 
    // User has liked current recipe
    else {
        // Remove like from state
        state.likes.deleteLike(currentID);

        //Toggle like button
        likesView.toggleLikeBtn(false);
        //Remove like from UI list
        likesView.deleteLike(currentID);
        console.log(state.likes);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


// Restore liked recipe on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    // restore likes
    state.likes.readStorage();

    // toggle the menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //render existing likes
    state.likes.likes.forEach(like => {
        likesView.renderLike(like);
    });
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', event => {
    if (event.target.matches('.btn-decrease, .btn-decrease *')) {   //* means child element of btn-decrease
        //decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
        
    }  else if (event.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (event.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shipping list
        controlList();
    } else if (event.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});


