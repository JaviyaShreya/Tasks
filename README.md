# TASK

## **Project: File-Based CRUD API with Event Logging**

### **Project Description**

This project aims to create a basic **CRUD (Create, Read, Update, Delete)** API using Node.js. The API will interact with a JSON file to store and manage data. Additionally, the application will use **Event Emitters** to log actions (like creating, updating, or deleting data) and an **HTTP server** to handle API requests.

---

### **Features**

1. **HTTP Server**: Create an HTTP server to handle incoming requests.
2. **API Routing**: Implement routing for different HTTP methods (GET, POST, PUT, DELETE).
3. **File System (fs)**: Use the `fs` module to read from and write to a JSON file (`data.json`) for data persistence.
4. **Event Emitter**: Emit events for every action (e.g., creating, updating, or deleting data) and log them to the console.
5. **CRUD Operations**:
    - **Create**: Add a new item to the JSON file.
    - **Read**: Fetch all items or a specific item by ID.
    - **Update**: Modify an existing item by ID.
    - **Delete**: Remove an item by ID.

NOTE: 
    - Install the UUID package and use it to create an ID.
    - Add item Name, Quantity, Price, status, createdAt Date, updateAt Date.
    - variable name must be meaningful.

---

### **Project Structure**

Copy

```
file-based-crud-api/
│
├── public/                  # Folder for static files
│   ├── index.html           # Example HTML file
│   ├── style.css            # Example CSS file
│   └── script.js            # Example JS file
├── data.json                # JSON file to store data
├── server.js                # Main server file
└── README.md                # Project documentation
```

---

### **Steps to Implement**

### 1. **Set Up the Project**

- Initialize a new Node.js project:
    
    
    ```
    npm init -y
    ```
    
- Install dependencies (if any):
    
    
    ```
    npm install
    ```
    

### 2. **Create `data.json`**

- Create a `data.json` file to store data in JSON format. Initially, it can be empty or contain some sample data:
    
    ```
    []
    ```
    

### 3. **Create the HTTP Server**

- Use Node.js's built-in `http` module to create a server.
- Parse incoming requests and route them based on the URL and HTTP method.

### 4. **Implement API Routing**

- Use `if-else` or `switch` statements to handle different routes and methods:
    - `GET /api/data`: Fetch all items.
    - `GET /api/data/:id`: Fetch a specific item by ID.
    - `POST /api/data`: Add a new item.
    - `PUT /api/data/:id`: Update an item by ID.
    - `DELETE /api/data/:id`: Delete an item by ID.

### 5. **Use the `fs` Module**

- Read and write data to `data.json` using the `fs` module.
- For example:
    - Use `fs.readFile` to read data from the file.
    - Use `fs.writeFile` to write updated data back to the file.

### 6. **Implement Event Emitter**

- Create a custom event emitter to log actions.
- Emit events like `itemCreated`, `itemUpdated`, and `itemDeleted` whenever the corresponding action is performed.
- Listen to these events and log messages to the console.

### **7. Steps to Add Static File Serving**

1. **Create a `public` Folder**:
    - Add an `index.html` file and any other static files (e.g., `style.css`, `script.js`) to the `public` folder.
2. **Modify the HTTP Server**:
    - Check if the request URL matches a file in the `public` folder.
    - Use the `fs` module to read the file and serve it with the appropriate `Content-Type` header.
3. **Handle Static File Requests**:
    - If the request URL starts with `/public/`, serve the corresponding file from the `public` folder.