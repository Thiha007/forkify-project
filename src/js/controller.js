import 'core-js/stable';
import { async } from 'regenerator-runtime';
import 'regenerator-runtime/runtime';
import * as model from './model';
import recipeView from './view/recipeView';
import searchView from './view/searchView';
import resultsView from './view/resultsView';
import paginationView from './view/paginationView';
import bookmarksView from './view/bookmarksView';
import addRecipeView from './view/addRecipeView';
import { MODAL_CLOSE_SEC } from './config';

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// if(module.hot){
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    // loading recipes
    await model.loadRecipe(id);

    // update search result to match the recipe view
    resultsView.update(model.getSearchResultPages());
    bookmarksView.update(model.state.bookmarks);

    // rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResult = async function () {
  try {
    resultsView.renderSpinner();

    // get search query
    const query = searchView.getQuery();

    // loading search result
    await model.loadSearchResult(query);

    // render search result
    // resultsView.render(model.state.search.result); // showing all results
    resultsView.render(model.getSearchResultPages()); // showing only 10 results per page

    // render pagination
    paginationView.render(model.state.search);
    console.log(model.state.search.result);
  } catch (err) {
    console.log(err);
  }
};

const conrtolPagination = function (goToPage) {
  // render new search result
  resultsView.render(model.getSearchResultPages(goToPage)); // showing only 10 results per page

  // render new pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServing) {
  // updating serving
  model.updateServings(newServing);

  // render new Serving
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // add/ delete bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else if (model.state.recipe.bookmarked) {
    model.deleteBookmark(model.state.recipe.id);
  }

  // update recipe view
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    // render spinner

    // upload recipe
    await model.uploadRecipe(newRecipe);

    // render recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change id in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close form window
    setTimeout(() => {
      addRecipeView._closeWindow();
      location.reload();
    }, MODAL_CLOSE_SEC * 1000);
    
  } catch (err) {
    console.log(err)
    console.error('*** ', err.message);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearchView(controlSearchResult);
  paginationView.addHandlerClick(conrtolPagination);
  bookmarksView.addHandlerRender(controlBookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  model.restoreLocalStorage();
};
init();
