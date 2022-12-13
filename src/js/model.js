import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config';
// import { getJSON , sendJSON } from './helper';
import { AJAX} from './helper';
export const state = {
  recipe: {},
  search: {
    query: '',
    result: [],
    page: 1,
    resultPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function(data) {
  let { recipe } = data.data;
    return {
      title: recipe.title,
      id: recipe.id,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      cookingTime: recipe.cooking_time,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      ...(recipe.key && {key : recipe.key}),
    };
}

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);
    if (Array.from(state.bookmarks).some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else state.recipe.bookmarked = false;
    
  } catch (err) {
    console.error(`${err} 😡😡😡`);
    throw err;
  }
};

export const loadSearchResult = async function (query) {
  try {
    state.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    state.search.result = data.data.recipes.map(rec => {
      return {
        title: rec.title,
        id: rec.id,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 😡😡😡`);
    throw err;
  }
};

export const getSearchResultPages = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultPerPage;
  const end = page * state.search.resultPerPage;
  return state.search.result.slice(start, end);
};

export const updateServings = function (newServing) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity * (newServing / state.recipe.servings);
  });
  state.recipe.servings = newServing;
};

const presistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // adding bookmark
  state.bookmarks.push(recipe);

  // mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  // adding to local storage according to state.bookmarks
  presistBookmarks();
};

export const deleteBookmark = function (id) {
  // deleting bookmark
  const ind = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(ind, 1);

  // mark current recipe as notbookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  // adding to local storage according to state.bookmarks
  presistBookmarks();
};

export const restoreLocalStorage = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

// to clear the local storage
const clear = function () {
  localStorage.removeItem('bookmarks');
};
// clear();

// uploading recipe
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)'
          );

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title : newRecipe.title,
      publisher : newRecipe.publisher,
      source_url : newRecipe.sourceUrl,
      image_url : newRecipe.image,
      cooking_time : newRecipe.cookingTime,
      servings : newRecipe.servings,
      ingredients
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
