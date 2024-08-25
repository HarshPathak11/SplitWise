
# Splitwise

Hello! Welcome to our Payment spliting website. Here we are trying to help people slipt their payments in a hasslefree way.

Here you can visit our repository and try out our website on your personal PC as well.

## Deployment

First make a folder and copy the zip version of this github repo.

Now unzip the file and go inside the unzipped folder twice.

To deploy this project run the following commands:

```bash
  cd backend
```

```bash
  npm i express, mongoose, nodemon, dotenv
```

Now go to the package.json file and change the script section with the following command:

```bash
 "scripts": {
    "start": "nodemon index.js"
  }
  ```

  Now your backend is all set to get deployed.

  Now to deploy your frontend just open a new     terminal in your code editor.
  
  Now run the following commands:
  
  ``` bash
  cd ..
  ```
  ``` bash
  cd frontend
  ```
  ``` bash
  npm i
  ```
  ``` bash
  npm run dev
  ```

  By running the above commands your frontend and backend are now successfully deployed and now you can view the application by following the link present on your terminal to open the application.
  
  And you can easily make any changes you wish to make on the application.