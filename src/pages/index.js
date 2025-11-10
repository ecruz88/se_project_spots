import "./index.css";
import { enableValidation, settings, resetValidation, disableButton } from "../scripts/validation.js";
import { setButtonText } from "../scripts/utils/helpers.js";
import Api from "../scripts/utils/Api.js";
import { initialCards } from "../scripts/utils/constants.js";


const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "2f3adc24-9e38-4f02-a724-91b9dff1adb4",
    "Content-Type": "application/json"
  }
});

api.getInitialCards()
.then((cards) =>{

});



api.getAppInfo()
  .then(([userData, cards]) => {
    userId = userData._id;
    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;
    document.querySelector(".profile__avatar").src = userData.avatar;

    cards.forEach((item) => {
      const cardEl = getCardElement(item);
      cardsList.append(cardEl);
    });
  })
  .catch(console.error);

const profileEditButton = document.querySelector(".profile__edit-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const addCardButton = document.querySelector(".profile__add-btn");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const addCardFormElement = document.querySelector("#add-card-form");
const captionInputElement = document.querySelector("#add-card-name-input");
const linkInputEl = document.querySelector("#add-card-link-input");


const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = document.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const cardModal = document.querySelector("#add-card-modal");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");

//Avatar form elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");


//Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");

const previewModal = document.querySelector("#preview-modal");
const previewModalClosedBtn = document.querySelector(".modal__close-btn_type_preview");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

let selectedCard, selectedCardId;
let userId; 

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

 if (data.isLiked || data.likes?.some(like => like._id === userId)) {
  cardElement.querySelector(".card__like-btn").classList.add("card__like-btn_active");
}  

function handleLike(evt, cardId) {
  const isLiked = evt.target.classList.contains("card__like-btn_active");

  api.changeLikeCardStatus(cardId, !isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-btn_active");
    })
    .catch(console.error);
}


  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageElement = cardElement.querySelector(".card__image");

  cardNameEl.textContent = data.name;
  cardImageElement.alt = data.name;
  cardImageElement.src = data.link;

  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
 
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-button");
  cardDeleteBtnEl.addEventListener("click", () => {
    cardElement.remove();
  });
  
  cardLikeBtnEl.addEventListener("click", (evt) => handleLike(evt, data._id));
  cardDeleteBtnEl.addEventListener("click", () => handleDeleteCard(cardElement, data._id));


  cardImageElement.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscape);
}


function resetFormValidation(formElement, config) {
  resetValidation(formElement, config);
}

function handleDeleteCard (cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Save", "Saving...");

  api.editUserInfo({
    name: editModalNameInput.value,
    about: editModalDescriptionInput.value,
  })
  .then((data) => {
    profileName.textContent = data.name;
    profileDescription.textContent = data.about;
    closeModal(editModal);
  })
  .catch(console.error)
  .finally(() => {
    setButtonText(submitBtn, false, "Save", "Saving...");
  });
}

//TODO- Implement loading text for all other form submission

// TODO finish avatar submission handler
function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Save", "Saving...");

  api.editAvatarInfo(avatarInput.value)
    .then((data) => {
      document.querySelector(".profile__avatar").src = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Save", "Saving...");
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  api.deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error);
}


profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, settings);
  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

addCardButton.addEventListener("click", () => {
  const inputList = Array.from(addCardFormElement.querySelectorAll(settings.inputSelector));
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

previewModalClosedBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

deleteForm.addEventListener("submit", handleDeleteSubmit);

addCardFormElement.addEventListener("submit", function (evt) {
  evt.preventDefault();

  const inputValues = {
  name: captionInputElement.value,
  link: linkInputEl.value,
  };

  const cardElement = getCardElement(inputValues);
  cardsList.prepend(cardElement);

  closeModal(cardModal);
  addCardFormElement.reset();
  disableButton(cardSubmitBtn, settings);
});

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === modal) {
      closeModal(modal);
    }
  });
});

enableValidation(settings);