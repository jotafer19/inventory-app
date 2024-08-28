<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genre Selector with Tags</title>
    <style>
        .tags-input {
            display: flex;
            flex-wrap: wrap;
            border: 1px solid #ccc;
            padding: 5px;
            border-radius: 5px;
            cursor: text;
        }

        .tags-input input {
            border: none;
            outline: none;
            flex-grow: 1;
            padding: 5px;
        }

        .tag {
            background-color: #e1e1e1;
            border-radius: 3px;
            display: flex;
            align-items: center;
            padding: 5px;
            margin: 2px;
            font-size: 14px;
        }

        .tag .remove-tag {
            background-color: #ff5c5c;
            color: white;
            border: none;
            border-radius: 50%;
            margin-left: 5px;
            cursor: pointer;
            padding: 0 5px;
        }
    </style>
</head>
<body>
    <label for="genresInput">Select genres:</label>
    <div class="tags-input" id="genresInput">
        <input type="text" list="genreList" placeholder="Type and select genres">
    </div>
    <datalist id="genreList">
        <option value="Action">
        <option value="Adventure">
        <option value="RPG">
        <option value="Strategy">
        <option value="Sports">
    </datalist>

    <script>
        const genresInputContainer = document.getElementById('genresInput');
        const inputElement = genresInputContainer.querySelector('input');

        inputElement.addEventListener('input', function() {
            const dataList = document.getElementById('genreList');
            const inputText = inputElement.value.trim().toLowerCase();
            const options = dataList.options;

            for (let i = 0; i < options.length; i++) {
                if (options[i].value.toLowerCase() === inputText) {
                    addTag(options[i].value);
                    inputElement.value = '';
                    break;
                }
            }
        });

        function addTag(text) {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = text;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-tag';
            removeBtn.textContent = 'X';
            removeBtn.addEventListener('click', function() {
                genresInputContainer.removeChild(tag);
            });

            tag.appendChild(removeBtn);
            genresInputContainer.insertBefore(tag, inputElement);
        }

        genresInputContainer.addEventListener('click', function() {
            inputElement.focus();
        });
    </script>
</body>
</html>