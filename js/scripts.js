$(document).ready(function () {
    let apiURL = 'https://randomuser.me/api/';
    let $gallery = $('#gallery');
    let $modalContainer = $('.modal-container');
    let $modalCloseBtn = $('#modal-close-btn');
    let $modalInfoContainer = $('.modal-info-container');
    let $modalNextButton = $('#modal-next');
    let $modalPrevButoon = $('#modal-prev');
    let $searchForm = $('#search-form');
    let $searchInput = $('#search-input');
    let users;

    /**
     * hide modal element when first start the widnow 
     */
    $modalContainer.addClass('js-hidden');

    /**
     * add event listener for gallery
     */
    $($gallery).on('click', galleryClickHandler);

    $modalCloseBtn.on('click', function () {
        $modalContainer.addClass('js-hidden');
    });

    // add event listener for next and prev button of modal 
    $modalNextButton.on('click', getNextUserHanlder);
    $modalPrevButoon.on('click', getPrevUserHandler);

    // add event listener for form submition 
    $searchForm.on('submit', function(e) {
        e.preventDefault();
        let searchingName = $($searchInput).val();
        let searchResult = searchingUserByName(searchingName);

        if (searchResult !== undefined) {
            if (searchResult.length === undefined) {
                let card = creatingCard(searchResult, 0);
                addingCardsIntoGalleryElement(card);
            } else {
                let cards = [];
                searchResult.forEach(function(user, index) {
                    cards.push(creatingCard(user, index));
                });
                addingCardsIntoGalleryElement(cards.join(''));
            }
        }
    });


    /**
     * fetching random user from randomuser api 
     * @param {Number} results - the amount of results you want to 
     * return from API
     */
    function fetchRandomUsers(results) {
        $.ajax({
            url: `${apiURL}?results=${results}&nat=us`,
            dataType: 'json',
            success: function (data) {
                let response = data;
                let results = response.results;
                users = results;
                let cards = [];

                results.forEach(function (user, index) {
                    cards.push(creatingCard(user, index));
                });

                addingCardsIntoGalleryElement(cards.join(''));
            },
            error: function (error) {
                if (error.status === 404) {
                    let errorMessage = '<h3>Oops something went wrong!</h3>';
                    $($gallery).append(errorMessage);
                }
            }
        });
    }

    fetchRandomUsers(12);

    /**
     * creating card element of each user
     * @param {Object} user - user data from api 
     */
    function creatingCard(user, index) {
        let cardElement = `
            <div class="card" data-email="${user.email}" data-index="${index}">
                <div class="card-img-container">
                    <img class="card-img" src="${user.picture.large}" alt="profile picture">
                </div>
                <div class="card-info-container">
                    <h3 id="name" class="card-name cap">${user.name.first} ${user.name.last}</h3>
                    <p class="card-text">${user.email}</p>
                    <p class="card-text cap">${user.location.city}, ${user.location.state}</p>
                </div>
            </div>
        `;
        return cardElement;
    }

    /**
     * adding card element of each user into gallery element
     * @param {String} cards 
     */
    function addingCardsIntoGalleryElement(cards) {
        $($gallery).html(cards);
    }

    /**
     * click handler for gallery 
     * @param {Object} event 
     */
    function galleryClickHandler(event) {
        let $currentTarget = event.target;
        let classNames = ['card-img-container', 'card-info-container', 'card'];
        let currentParent = $($currentTarget).parent();
        let className = currentParent[0].className;
        if (classNames.indexOf(className) > -1) {
            let currentUserEmail;
            let currentUserIndex;
            $modalContainer.removeClass('js-hidden');
            if (className === 'card-img-container' || className === 'card-info-container') {
                currentUserEmail = $(currentParent).parent().data('email');
                currentUserIndex = $(currentParent).parent().data('index');
            } else {
                currentUserEmail = $(currentParent).data('email');
                currentUserIndex = $(currentParent).data('index');
            }
            readUserInfo(currentUserEmail, currentUserIndex);
        }
    }

    /**
     * read user info by email
     * @param {String} userEmail 
     */
    function readUserInfo(userEmail, index) {
        let user = users.filter(user => user.email === userEmail)[0];
        writingUserInfoIntoModal(user, index);
    }

    /**
     * writing user info into modal for display 
     * @param {Object} user 
     */
    function writingUserInfoIntoModal(user, index) {
        let userInfo = `
            <img class="modal-img" src="${user.picture.large}" alt="profile picture">
            <h3 id="name" class="modal-name cap">${user.name.first} ${user.name.last}</h3>
            <p class="modal-text">${user.email}</p>
            <p class="modal-text cap">${user.location.city}</p>
            <hr>
            <p class="modal-text">${user.phone}</p>
            <p class="modal-text">${user.location.street}, ${user.location.state}, ${user.location.postcode}</p>
            <p class="modal-text">Birthday: ${generateUserBirthday(user.dob.date)}</p>
            <input type="hidden" name="current-user-index" value="${index}">
        `;
        $($modalInfoContainer).html(userInfo);
    }

    /**
     * generating date of birthday of user with the new format 
     * @param {String} dateOfBirthday 
     */
    function generateUserBirthday(dateOfBirthday) {
        let dob = new Date(dateOfBirthday);
        let year = dob.getFullYear();
        let day = dob.getDay() < 10 ? '0' + dob.getDay() : dob.getDay();
        let month = dob.getMonth() < 10 ? '0' + dob.getMonth() : dob.getMonth();
        return `${day}/${month}/${year}`;
    }

    /**
     * get next user info
     */
    function getNextUserHanlder() {
        let index = parseInt($($modalInfoContainer).find('input[name="current-user-index"]').val()) + 1;
        if (index < users.length) {
            let nextUser = users[index];
            writingUserInfoIntoModal(nextUser, index);
        }
    }

    /**
     * get prev user info
     */
    function getPrevUserHandler() {
        let index = parseInt($($modalInfoContainer).find('input[name="current-user-index"]').val());
        if (index === 0) {
            let nextUser = users[index];
            writingUserInfoIntoModal(nextUser, index);
        } else {
            index -= 1;
            if (index >= 0) {
                let nextUser = users[index];
                writingUserInfoIntoModal(nextUser, index);
            }
        }
    }

    /**
     * searching user by name
     * @param {String} name - user name 
     * @returns {Object} user
     */
    function searchingUserByName(name) {
        if (name.trim().length === 0) {
            return users;
        } else {
            let nameTolowercase = name.toLowerCase();
            let splitedName = nameTolowercase.split(' ');
            let foundUser = [];

            let sortedUser = users.sort(function (a, b) {
                if (a.name.first < b.name.first) {
                    return -1;
                }
                if (a.name.first > b.name.first) {
                    return 1;
                }
                return 0;
            });

            let mappedUsers = users.map(function(user) {
                user.name.fullname = user.name.first + ' ' + user.name.last;
                return user;
            });

            if (splitedName.length > 1) {
                for(let i = 0; i < mappedUsers.length; i++) {
                    if (mappedUsers[i].name.fullname === nameTolowercase) {
                        return mappedUsers[i];
                    }
                }
            } else {
                for (let i = 0; i < sortedUser.length; i++) {
                    if (sortedUser[i].name.first === nameTolowercase || sortedUser[i].name.last === nameTolowercase) {
                        return sortedUser[i];
                    }
                }
            }

            return;
        }
    }
});