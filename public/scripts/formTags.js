const genresElements = {
  allItems: document.querySelectorAll(".genre-item"),
  container: document.querySelector(".genres-container"),
  input: document.querySelector("#genres-input"),
  hiddenInput: document.querySelector("#genres-tags"),
  suggestions: document.querySelector("#genres-suggestions")
}

const developersElements = {
  allItems: document.querySelectorAll(".developer-item"),
  container: document.querySelector(".developers-container"),
  input: document.querySelector("#developers-input"),
  hiddenInput: document.querySelector("#developers-tags"),
  suggestions: document.querySelector("#developers-suggestions")
}

const availableGenres = [...genresElements.allItems].map((tag) => tag.textContent);
const availableDevelopers = [...developersElements.allItems].map((tag) => tag.textContent)

let selectedTags = { genres: [], developers: [] };

function addTag(tag, type, availableItems) {
  if (!selectedTags[type].includes(tag)) {
    selectedTags[type].push(tag);
    updateTags(type, availableItems);
  }
}

function updateTags(type, elements) {
  const { container, hiddenInput, input } = elements;

  container.textContent = "";
  hiddenInput.value = selectedTags[type].join(",");

  selectedTags[type].forEach((tag, index) => {
    const tagElement = createTagElement(tag, index, type, elements);
    container.appendChild(tagElement);
  });

  container.appendChild(input);
  input.value = "";
  input.focus();
}

function createTagElement(tag, index, type, elements) {
  const tagElement = document.createElement("div");
  tagElement.className = "tag";
  tagElement.textContent = tag;

  const removeButton = document.createElement("span");
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => removeTag(index, type, elements));

  tagElement.appendChild(removeButton);
  return tagElement;
}

function removeTag(index, type, elements) {
  selectedTags[type].splice(index, 1);
  updateTags(type, elements);
}

function handleInput(query, availableItems, selectedItems, suggestionsElement, type, elements) {
  suggestionsElement.textContent = "";
  
  const filteredItems = availableItems.filter(
    item => item.toLowerCase().includes(query.toLowerCase()) && !selectedItems.includes(item)
  );

  if (filteredItems.length) {
    suggestionsElement.style.display = "block";
    filteredItems.forEach(item => {
      const suggestion = document.createElement("li");
      suggestion.className = `${type}-item`;
      suggestion.textContent = item;
      suggestion.addEventListener("click", () => {
        addTag(item, type, elements);
        suggestionsElement.style.display = "none";
      });
      suggestionsElement.appendChild(suggestion);
    });
  } else {
    suggestionsElement.style.display = "none";
  }
}

function attachInputHandler(type, availableItems, elements) {
  elements.input.addEventListener("input", () => {
    handleInput(elements.input.value, availableItems, selectedTags[type], elements.suggestions, type, elements);
  });
}

function hideSuggestionsOnClickOutside(elements) {
  document.addEventListener("click", event => {
    if (!elements.container.contains(event.target)) {
      elements.suggestions.style.display = "none";
    }
  });
}

attachInputHandler('genres', availableGenres, genresElements);
attachInputHandler('developers', availableDevelopers, developersElements);
hideSuggestionsOnClickOutside(genresElements);
hideSuggestionsOnClickOutside(developersElements);