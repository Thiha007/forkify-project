import View from '../view/view.js';
import icons from 'url:../../img/icons.svg';

class paginationView extends View {
  _parentElement = document.querySelector('.pagination');
  currPage = '';

  addHandlerClick(handler){
    this._parentElement.addEventListener('click',e => {
      const btn = e.target.closest('.btn--inline');
      if(!btn) return;
      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    })
  }
  _generateMarkup() {
    this.currPage = this._data.page;
    const numPages = Math.ceil(
      this._data.result.length / this._data.resultPerPage
    );

    // page 1 and there are also are pages
    if (this.currPage === 1 && numPages > 1) {
      return this._generateMarkupButtonNext();
    }

    // last page
    if (this.currPage === numPages && numPages > 1) {
      return this._generateMarkupButtonPrev();
    }

    // other pages
    if (this.currPage < numPages) {
      return (this._generateMarkupButtonPrev()+this._generateMarkupButtonNext());
    }

    // there is only one page
    return '';
  }
  _generateMarkupButtonNext() {
    return `
          <button data-goto="${this.currPage + 1}" class="btn--inline pagination__btn--next">
            <span>Page ${this.currPage + 1}</span>
            <svg class="search__icon">
              <use href="${icons}}#icon-arrow-right"></use>
            </svg>
          </button>`;
  }
  _generateMarkupButtonPrev() {
    return `
          <button data-goto="${this.currPage - 1}" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${this.currPage - 1}</span>
          </button>`;
  }
}

export default new paginationView();
