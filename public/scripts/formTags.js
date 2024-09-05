const availableTags = ["Apple", "Banana", "Orange", "Grapes", "Mango", "Pineapple", "Strawberry"];
const tagContainer = document.querySelector('.tag-container');
const input = document.querySelector('#tag-input');
const suggestions = document.querySelector('#suggestions');

let selectedTags = [];

const addTag = (tag) => {
    if (selectedTags.includes(tag)) return;
    selectedTags.push(tag)
    updateTags()
}

const updateTags = () => {
    tagContainer.textContent = ""

    selectedTags.forEach((tag, index) => {
        const tagElement = document.createElement("div")
        tagElement.classList.add("tag")
        tagElement.textContent = tag;

        const removeButton = document.createElement("span")
        removeButton.textContent = "×"
        removeButton.addEventListener("click", () => removeTag(index))

        tagElement.appendChild(removeButton);
        tagContainer.appendChild(tagElement);
    })

    tagContainer.appendChild(input);
    input.value = "";
    input.focus();
}

const removeTag = (index) => {
    selectedTags.splice(index, 1);
    updateTags();
}

input.addEventListener("input", () => {
    suggestions.textContent = "";
    const query = input.value.toLowerCase();
    const filteredTags = availableTags.filter(tag => tag.toLowerCase().includes(query) && !selectedTags.includes(tag));

    if (filteredTags.length > 0) {
        suggestions.style.display = "block";
        filteredTags.forEach(tag => {
            const li = document.createElement("li");
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
