'use strict';
const apiKey = typeof config != 'undefined' ? config.key : '<<key here>>';
// add TMDB API key in this section ^^
const auth = `api_key=${apiKey}`;
const baseURL = 'https://api.themoviedb.org/3/';

console.clear();
const discoverContainer = document.querySelector('#discover-container');
const searchContainer = document.querySelector('.search--container');
const searchField = document.querySelector('#search-field');
const btnFavorites = document.querySelector('#btn-favorites');
const btnDiscover = document.querySelector('#btn-discover');
const btnClearSearch = document.querySelector('#clear-search');

const favorites = JSON.parse(sessionStorage.getItem('favoriteMovies')) ?? [];
let currentTab;

const initMovies = () => {
	setActiveTab(btnDiscover);
	btnClearSearch.classList.remove('active');
	fetch(`${baseURL}discover/movie?${auth}`)
		.then((response) => response.json())
		.then((data) => {
			populateMovies(data.results);
		})
		.catch((err) => {
			handleEmptyScreen();
			console.log(`Error when initializing discover tab: ${err}`);
		});
};
initMovies();

const handleEmptyScreen = (screen = 'default') => {
	console.log('fn works');
	const emptyScreenMsg = document.createElement('p');
	emptyScreenMsg.classList.add('empty-screen');
	const emptyMsg = {
		search: 'No results matched your search.',
		favorites: 'You have no favorites yet.',
		default: 'Something went wrong with the API call :(',
	};
	emptyScreenMsg.textContent = emptyMsg[screen];
	discoverContainer.append(emptyScreenMsg);
};

function populateMovies(movies, screen) {
	console.log(this);
	discoverContainer.innerHTML = '';
	if (movies.length) {
		movies.forEach((movie) => {
			// console.log(movie);
			discoverContainer.innerHTML += `<div class="movie-box">
    <div class="thumbnail-container">
    <img src="https://image.tmdb.org/t/p/w300/${movie.backdrop_path}" />
    </div>
    <div class="movie-info">
    <p class="movie-info--title">${movie.original_title}</p>
    <p class="movie-info--release">${movie.release_date}</p>
    <input type="checkbox" data-id=${movie.id} class="favorite-checkmark">
    </div>
    </div>`;
		});
	} else {
		handleEmptyScreen(screen);
	}
	setAlreadyFavorited(movies);
	document.querySelectorAll('.favorite-checkmark').forEach((favoriteCheckmark) => {
		favoriteCheckmark.addEventListener('change', setFavorite);
	});
}

function searchMovie() {
	const searchStr = encodeURI(searchField.value);
	if (searchStr) {
		fetch(`${baseURL}search/movie?${auth}&query=${searchStr}`)
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				populateMovies(data.results, 'search');
			})
			.catch((err) => {
				handleEmptyScreen();
				console.log(`Error when searching: ${err}`);
			});
		btnClearSearch.classList.add('active');
	} else {
		initMovies();
	}
}

function setFavorite() {
	const favoritedId = this.getAttribute('data-id');
	const byeGrandpa = () => {
		this.parentElement.parentElement.classList.add('fade-out');
		setTimeout(() => {
			this.parentElement.parentElement.remove();
		}, 500);
	};

	const attemptSetFavorite = new Promise((resolve, reject) => {
		if (this.checked) {
			fetch(`${baseURL}movie/${favoritedId}?${auth}`)
				.then((response) => response.json())
				.then((data) => {
					favorites.push(data);
					resolve('favorited');
				})
				.catch((err) => reject(`set favorite error: ${err}`));
			this.classList.add('green-flair');
			setTimeout(() => this.classList.remove('green-flair'), 500);
		} else {
			try {
				favorites.splice(
					favorites.findIndex((movie) => movie.id == favoritedId),
					1
				);
				currentTab === 'Favorites' && byeGrandpa();
				resolve('unfavorited');
			} catch (err) {
				reject(`set unfavorite error: ${err}`);
			}
		}
	});

	attemptSetFavorite
		.then((message) => {
			console.log(favoritedId, message);
			this.classList.toggle('favorited');
			sessionStorage.setItem('favoriteMovies', JSON.stringify(favorites));
		})
		.catch((message) => {
			console.log(message);
		});
}

function setAlreadyFavorited(movieList) {
	try {
		favorites &&
			favorites.forEach((favorite) => {
				if (movieList.find((movie) => movie.id === favorite.id)) {
					const currentFavorite = document.querySelector(`.favorite-checkmark[data-id="${favorite.id}"]`);
					currentFavorite.checked = true;
					currentFavorite.classList.add('favorited');
				}
			});
	} catch (err) {
		console.log(`Error when setting already favorited: ${err}`);
	}
}

let debounceTimer;
const debounce = (searchFn) => {
	window.clearTimeout(debounceTimer);
	debounceTimer = window.setTimeout(searchFn, 1000);
};
searchField.addEventListener('input', () => debounce(searchMovie));

btnDiscover.addEventListener('click', () => {
	initMovies();
});
btnFavorites.addEventListener('click', () => {
	setActiveTab(btnFavorites);
	populateMovies(favorites, 'favorites');
});

searchField.addEventListener('focus', toggleSearchFocus);
searchField.addEventListener('blur', toggleSearchFocus);

function toggleSearchFocus() {
	searchContainer.classList.toggle('focused');
}

btnClearSearch.addEventListener('click', () => {
	searchField.value = '';
	initMovies();
});

function setActiveTab(targetBtn) {
	document.querySelector('.btn.active')?.classList.remove('active');
	targetBtn.classList.toggle('active');
	currentTab = targetBtn.textContent;
}
