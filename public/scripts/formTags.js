const allTags = document.querySelectorAll(".genre-item");
const tagContainer = document.querySelector(".genres-container");
const input = document.querySelector("#genres-input");
const hiddenInput = document.querySelector("#genre-tags")
const suggestions = document.querySelector("#genres-suggestions");

const availableTags = [...allTags].map((tag) => tag.textContent);
let selectedTags = [];

function addTag(tag) {
  if (selectedTags.includes(tag)) return;
  selectedTags.push(tag);
  updateTags();
}

function updateTags() {
  tagContainer.textContent = "";

  hiddenInput.value = selectedTags.join(",")

  selectedTags.forEach((tag, index) => {
    const tagElement = document.createElement("div");
    tagElement.className = "tag";
    tagElement.textContent = tag;

    const removeButton = document.createElement("span");
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => removeTag(index));

    tagElement.appendChild(removeButton);
    tagContainer.appendChild(tagElement);
  });

  tagContainer.appendChild(input);
  input.value = "";
  input.focus();
}

function removeTag(index) {
  selectedTags.splice(index, 1);
  updateTags();
}

input.addEventListener("input", () => {
  suggestions.textContent = "";
  
  const query = input.value.toLowerCase();
  const filteredTags = availableTags.filter(
    (tag) => tag.toLowerCase().includes(query) && !selectedTags.includes(tag),
  );

  if (filteredTags.length > 0) {
    suggestions.style.display = "block";
    filteredTags.forEach((tag) => {
      const li = document.createElement("li");
      li.classList.add("item", "genre-item");
      li.textContent = tag;
      li.addEventListener("click", () => {
        addTag(tag);
        suggestions.style.display = "none";
      });
      suggestions.appendChild(li);
    });
  } else {
    suggestions.style.display = "none";
  }
});

document.addEventListener("click", (event) => {
  if (!tagContainer.contains(event.target)) {
    suggestions.style.display = "none";
  }
});
