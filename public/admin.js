//Admin.js will handle the form login query input as well as db handlers
const loginInfo = new URLSearchParams(window.location.search);
const username = loginInfo.get('username');
const password = loginInfo.get('password');
const screen = document.getElementById('root');

//Check if credentials are correct
if(username.match(/^admin$/) != null) {
    if(password.match(/^root$/) != null)
        loadAdminPage()
    else
        loadErrPage()
} else
    loadErrPage()

//Error handling
function loadErrPage() {
    //Just send them back to the index
    alert("Incorrect login!");
    window.location.href = window.location.origin;
}

//Admin Page Load
async function loadAdminPage() {
    let logout = 
    `<div><a href="${window.location.origin}" class="btn">Logout</a></div>`;
    screen.innerHTML = logout;
    //Grab the list of books
    let books = await fetch("http://localhost:3001/listBooks");
        books = await books.json();
    
    //Create entries for each book with a surrounding container
    let blc = document.createElement('div');
    blc.id = "bookListContainer";
    books.forEach(book => {
        blc.innerHTML += createMutableEntry(book)
    });

    //Append the bookList container
    screen.append(blc);

    //Create and append form
    let bookForm = 
    `<div class="my-1 px-1">
        <h3>Add book</h3>
        <label for="bTitle">Book Title: </label><input type="text" id="bTitle" placeholder="Title..." class="my-1" /><br>
        <label for="bDesc">Book Description: </label><input type="text" id="bDesc" rows="3" cols="32" placeholder="Description..." class="my-1" /><br>
        <label for="bImg">Book Image URL: </label><input type="text" id="bImg" placeholder="http://www.example.com/" class="my-1" /><br>
        <input type="button" onclick="addBook()" value="Add Book" />
    </div>`;
    screen.innerHTML += bookForm;
}

//Function goal is to create visual data entry for data retrieved from the server
function createMutableEntry(book) {
    //The book object passed should have all the data needed to create the entry
    let data = `<div class="py-1" id="container${book.id}"><label for="book${book.id}">${book.title}</label><input type="number" id="book${book.id}" class="mx-1" value="${book.quantity}" /><input type="button" value="Save" onclick="saveBook(${book.id})" class="mx-1" /><input type="button" value="Delete" onclick="removeBook(${book.id})" class="mx-1" /><br></div>`;

    return data
}

//Runs the proper update request to save the book
async function saveBook(id) {
    let count = Number(document.getElementById('book'+id).value);
    let res = await fetch('http://localhost:3001/updateBook',{
        method: "PATCH",
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            "id": id,
            "quantity": count
        })
    });
}
//Runs the proper remove request
async function removeBook(id) {
    let res = await fetch(`http://localhost:3001/removeBook/${id}`,{
        method: "DELETE",
        headers: {'Content-Type':'application/json'}
    });
    if(res.status === 200) {
        //Deletion success remove it visually
        document.getElementById('container'+id).remove();
    }
}
//Runs proper validation to send add request
async function addBook() {
    //Grab values of each input
    let title = document.getElementById('bTitle').value,
        desc = document.getElementById('bDesc').value,
        url = document.getElementById('bImg').value;

    //Validate that they aren't null
    if(!(title == "" || desc == "" || url == "")) {
        //None are null  fetch the info

        let res = await fetch('http://localhost:3001/addBook',{
            method: "POST",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "title": title,
                "quantity": 1,
                "description": desc,
                "imageURL": url,
                "year": (new Date().getFullYear()),
            })
        });

        let book = await res.json();

        if(res.status === 200) {
            //Book added successfully invoke the listBook again
            let bookListContainer = document.getElementById('bookListContainer');
            let entry = createMutableEntry(book);
            let text = bookListContainer.innerHTML + entry;

            //Reassign the InnerHTML of the container to be the updated contante
            bookListContainer.innerHTML = text;
        }
    } else {
        alert('Missing Field Data!')
    }
}
