class Api {
  constructor(options) {
    // constructor body
  }

  getInitialCards() {
    return fetch("https://around-api.en.tripleten-services.com/v1/cards", {
  headers: {
    authorization: "2f3adc24-9e38-4f02-a724-91b9dff1adb4"
  }
})
  .then(res => res.json())
  }

  // other methods for working with the API
}

export default Api;
