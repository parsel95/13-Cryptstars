import {renderUsers} from './users.js';
import {createDataUser} from './user.js';

async function getDataUsersArray (callback) {
  try {
    const response = await fetch('https://cryptostar.grading.htmlacademy.pro/contractors');
    const users = await response.json();

    callback(users);

    // if (!response.ok) {
    //   throw new Error(showAlert('Не удалось получить данные с сервера. Попробуйте ещё раз'));
    // }
  } catch (error) {
    // showAlert('Не удалось получить данные с сервера. Попробуйте ещё раз');
  }
}

const getDataUsers = () => {
  getDataUsersArray(renderUsers);
};

async function getDataUserObject (callback) {
  try {
    const response = await fetch('https://cryptostar.grading.htmlacademy.pro/user');
    const user = await response.json();

    callback(user);

  } catch (error) {
    // showAlert('Не удалось получить данные с сервера. Попробуйте ещё раз');
  }
}

const getDataUser = () => {
  getDataUserObject(createDataUser);
};


export {getDataUsers, getDataUser, getDataUserObject, getDataUsersArray};
