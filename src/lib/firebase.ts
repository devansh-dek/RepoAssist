// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArG4wsAKBAItwYVVDW52KCGGwUwh1RxWo",
  authDomain: "repoassist-92d9e.firebaseapp.com",
  projectId: "repoassist-92d9e",
  storageBucket: "repoassist-92d9e.firebasestorage.app",
  messagingSenderId: "329203583150",
  appId: "1:329203583150:web:80935ffca38deed185c53f",
  measurementId: "G-HWHPX2DPPP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage=getStorage(app);

export async function uploadFile(file:File,setProgress?:(progress:number)=>void){
  return new Promise((resolve,reject)=>{
    try {
      const storageRef=ref(storage,file.name);
      const uploadTask=uploadBytesResumable(storageRef,file);

      uploadTask.on('state_changed',(snapshot)=>{
        const progress=Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100);
        if(setProgress){
          setProgress(progress);
        }
        switch(snapshot.state){
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      },error=>{
        console.log(error);
        reject(error);
      },()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
          resolve(downloadURL);
        })
      })
    } catch (error) {
      console.log(error);
      reject(error);
    }
  })
}