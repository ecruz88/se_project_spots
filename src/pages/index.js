import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";
import Api from "../scripts/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "2f3adc24-9e38-4f02-a724-91b9dff1adb4",
    "Content-Type": "application/json",
  },
});

const profileEditButton = document.querySelector(".profile__edit-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const addCardButton = document.querySelector(".profile__add-btn");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const cardsList = document.querySelector(".cards__list");

const editModal = document.querySelector("#edit-modal");
const editFormElement = document.querySelector("#edit-profile-form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = document.querySelector("#profile-name-input");
const editModalDescriptionInput = document.querySelector(
  "#profile-description-input"
);

const cardModal = document.querySelector("#add-card-modal");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const addCardFormElement = document.querySelector("#add-card-form");
const captionInputElement = document.querySelector("#add-card-name-input");
const linkInputEl = document.querySelector("#add-card-link-input");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteCancelBtn = deleteModal.querySelector(".modal__cancel-btn");

const previewModal = document.querySelector("#preview-modal");
const previewModalClosedBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

const cardTemplate = document.querySelector("#card-template");

let userId = null;
let cardToDeleteElement = null;
let cardToDeleteId = null;

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscape);
}

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) closeModal(openedModal);
  }
}

const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === modal) closeModal(modal);
  });
});

function createCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");
  const likeBtn = cardElement.querySelector(".card__like-btn");
  const likeCountEl = cardElement.querySelector(".card__like-count");
  const deleteBtn = cardElement.querySelector(".card__delete-button");

  cardTitleEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  likeCountEl.textContent = data.likes ? data.likes.length : 0;

  if (data.isLiked) {
    likeBtn.classList.add("card__like-btn_active");
  } else {
    likeBtn.classList.remove("card__like-btn_active");
  }

  likeBtn.addEventListener("click", (evt) => {
   
    api
      .changeLikeCardStatus(data._id, data.isLiked)
      .then((updatedCard) => {
        if (updatedCard.isLiked) {
          likeBtn.classList.add("card__like-btn_active");
        } else {
          likeBtn.classList.remove("card__like-btn_active");
        }
        likeCountEl.textContent = updatedCard.likes
          ? updatedCard.likes.length
          : 0;
      })
      .catch(console.error);
  });

  deleteBtn.addEventListener("click", () => {
    cardToDeleteElement = cardElement;
    cardToDeleteId = data._id;
    openModal(deleteModal);
  });

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

api
  .getAppInfo()
  .then(([userData, cards]) => {
    userId = userData._id;
    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;
    document.querySelector(".profile__avatar").src = userData.avatar;

    cards.forEach((cardData) => {
      const cardEl = createCardElement(cardData);
      cardsList.append(cardEl);
    });
  })
  .catch(console.error);

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Save", "Saving...");

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((updatedUser) => {
      profileName.textContent = updatedUser.name;
      profileDescription.textContent = updatedUser.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Save", "Saving...");
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Save", "Saving...");

  api
    .editAvatarInfo({ avatar: avatarInput.value })
    .then((data) => {
      document.querySelector(".profile__avatar").src = data.avatar;
      avatarForm.reset();
      disableButton(avatarSubmitBtn, settings);
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Save", "Saving...");
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Save", "Saving...");

  api
    .addCard({
      name: captionInputElement.value,
      link: linkInputEl.value,
    })

    .then((newCard) => {
      const cardEl = createCardElement(newCard);
      cardsList.prepend(cardEl);
      addCardFormElement.reset();
      disableButton(cardSubmitBtn, settings);
      closeModal(cardModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Save", "Saving...");
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Delete", "Deleting...");
  if (!cardToDeleteId || !cardToDeleteElement) {
    closeModal(deleteModal);
    return;
  }

  api
    .deleteCard(cardToDeleteId)
    .then(() => {
      cardToDeleteElement.remove();
      cardToDeleteElement = null;
      cardToDeleteId = null;
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Delete", "Deleting...");
    });
  }

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, settings);
  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => closeModal(editModal));
editFormElement.addEventListener("submit", handleEditFormSubmit);

addCardButton.addEventListener("click", () => {
  resetValidation(addCardFormElement, settings);
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => closeModal(cardModal));
addCardFormElement.addEventListener("submit", handleAddCardSubmit);

avatarModalBtn.addEventListener("click", () => {
  resetValidation(avatarForm, settings);
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => closeModal(avatarModal));
avatarForm.addEventListener("submit", handleAvatarSubmit);

deleteModalCloseBtn.addEventListener("click", () => {
  cardToDeleteElement = null;
  cardToDeleteId = null;
  closeModal(deleteModal);
});

deleteCancelBtn.addEventListener("click", () => {
  cardToDeleteElement = null;
  cardToDeleteId = null;
  closeModal(deleteModal);
});

deleteForm.addEventListener("submit", handleDeleteSubmit);

previewModalClosedBtn.addEventListener("click", () => closeModal(previewModal));

enableValidation(settings);
