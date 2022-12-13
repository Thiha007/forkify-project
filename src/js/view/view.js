import { mark } from 'regenerator-runtime';
import icons from 'url:../../img/icons.svg';

export default class View {
  _data;

  // this is how to write documentation of your code write /** */
  /**
   * get the data and render to the view
   * @param {*} data 
   * @returns undefined 
   * @this [Object] view instance
   * @todo need to finish implementation
   */
  render(data) {
    if(!data || (Array.isArray(data) && data.length===0)) return this.renderError();
    this._data = data;
    const markup = this._generateMarkup();

    this.clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data){
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDom = document.createRange().createContextualFragment(newMarkup);
    const newElement = Array.from(newDom.querySelectorAll('*'))
    const currElement = Array.from(this._parentElement.querySelectorAll('*'))
    newElement.forEach((newEl,i)=>{
      const currEl = currElement[i];
      if(!newEl.isEqualNode(currEl) && newEl.firstChild?.nodeValue.trim() !==''){
        currEl.textContent = newEl.textContent;
      }

      if(!newEl.isEqualNode(currEl)){
        // changing the attribute
        Array.from(newEl.attributes).forEach(attr => currEl.setAttribute(attr.name, attr.value));
      }
    });
  }

  clear() {
    this._parentElement.innerHTML = '';
  }

  addHandlerRender(handler) {
    ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  renderError(message = this._errorMessage) {
    const markup = `
          <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>`;

    this.clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._message) {
    const markup = `
          <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${this._message}</p>
          </div>`;

    this.clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderSpinner = function () {
    const markup = `
       <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>
  `;
    this.clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  };
}
