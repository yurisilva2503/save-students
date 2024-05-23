const html = document.documentElement;
const checkbox = html.querySelector("#switch_dark-mode");
const btnAddStudent = html.querySelector("#btn_add-student");
const btnEditStudent = html.querySelector("#btn_update-student");
const toastElement = html.querySelector("#toast-sleep");
const table = html.querySelector("#table");
const tbody = table.querySelector("tbody");

let editingStudentId = null;

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", applyTheme);
checkbox.addEventListener("change", function () {
  const label = document.querySelector(".inputs_container label");
  if (this.checked) {
    label.innerHTML = "toggle_on";
    label.style.color = "white";
  } else {
    label.innerHTML = "toggle_off";
    label.style.color = "black";
  }
  html.classList.toggle("dark-mode");
});

window.addEventListener("resize", function () {
  const screenWidth = window.innerWidth;

  if (screenWidth <= 480) {
    document.getElementById("btn_add-student").textContent = "Add";
    document.getElementById("btn_update-student").textContent = "Att";
  } else {
    document.getElementById("btn_add-student").textContent = "Adicionar";
    document.getElementById("btn_update-student").textContent = "Atualizar";
  }
});

function applyTheme() {
  const label = document.querySelector(".inputs_container label");
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    html.classList.add("dark-mode");
    checkbox.checked = true;
    label.innerHTML = "toggle_on";
    label.style.color = "white";
  } else {
    html.classList.remove("dark-mode");
    checkbox.checked = false;
    label.innerHTML = "toggle_off";
    label.style.color = "black";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const studentsData = JSON.parse(localStorage.getItem("studentsData")) || [];
  studentsData.forEach((student) => renderStudent(student));
  btnEditStudent.style.display = "none";
  applyTheme();

  Notification.requestPermission().then(function(permission) {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    } else {
      console.log('Unable to get permission to notify.');
    }
  });
});

function addStudent() {
  let name = html.querySelector("#name").value;
  let n1 = html.querySelector("#n1").value;
  let n2 = html.querySelector("#n2").value;

  n1 = n1.replace(",", ".");
  n2 = n2.replace(",", ".");

  let name_number_validator = hasNumber(name);

  if (name === null || name === "") {
    showToast("Insira um nome ⚠️");
    sendNotification("Nome ⚠️", "Insira um nome ⚠️")
    return
  } else if (name_number_validator == true) {
    showToast("Nome inválido ❌");
    sendNotification("Nome ❌", "Nome inválido ❌")
    return
  } else if (n1 == "" || n2 == "") {
    showToast("Insira todas as notas ⚠️");
    sendNotification("Notas ⚠️", "Insira todas as notas ⚠️")
    return
  } else if (n1 < 0 || n2 < 0 || n1 > 10 || n2 > 10) {
    showToast("Remova notas maiores que 10 ⚠️");
    sendNotification("Notas ⚠️", "Remova notas maiores que 10 ⚠️")
    return
  } else {
    n1 = Number(n1);
    n2 = Number(n2);

    if (isNaN(n1) == true || isNaN(n2) == true) {
      showToast("Insira uma nota válida ⚠️");
      sendNotification("Nota ⚠️", "Insira uma nota válida ⚠️")
    } else {
      let average = calcAverage(n1, n2);
      let result = "";

      if (average >= 7 && average <= 10) {
        result = "Aprovado(a)";
      } else if (average < 7) {
        result = "Reprovado(a)";
      }
      const studentsData =
        JSON.parse(localStorage.getItem("studentsData")) || [];
      const existingStudent = studentsData.find(
        (student) =>
          removeSpacesandToLowerCase(student.name) ===
          removeSpacesandToLowerCase(name)
      );

      if (existingStudent) {
        showToast("Este aluno já existe ⚠️");
        sendNotification("Aluno ⚠️", "Este aluno já existe ⚠️")
      } else {
        const id = generateUniqueId();
        const student = { id, name, n1, n2, average, result };

        studentsData.push(student);
        localStorage.setItem("studentsData", JSON.stringify(studentsData));

        renderStudent(student);

        html.querySelector("#name").value = "";
        html.querySelector("#n1").value = "";
        html.querySelector("#n2").value = "";
        showToast("Aluno(a) adicionado(a) ✅");
        sendNotification("Adicionado(a)", "Aluno(a) adicionado(a) ✅")
      }
    }
  }
}

function removeSpacesandToLowerCase(text) {
  text = text.replace(/\s/g, "");
  text = text.toLowerCase();
  return text;
}

function renderStudent(student) {
  tbody.innerHTML += `<tr id='aluno_${student.id}'> 
        <th scope='row' class='th_name-student'> ${student.name} </th> 
        <td class='td_nota-01'> ${student.n1} </td> 
        <td class='td_nota-02'> ${student.n2} </td> 
        <td class='td_media'> ${student.average} </td> 
        <td class='td_result'> ${student.result} </td>
        <td class='td_actions'> <span class='material-symbols-outlined -delete' onclick='deleteStudent("${student.id}")'>delete</span> <span class='material-symbols-outlined -edit' onclick='editStudent("${student.id}")'>edit</span></tr>`;
}

function calcAverage(...args) {
  let average = 0;
  for (let i = 0; i < args.length; i++) {
    average += args[i];
  }
  return average / args.length;
}

function showToast(message) {
  toastElement.innerHTML = message;
  toastElement.id = "toast-called";
  setTimeout(function () {
    toastElement.id = "toast-back";
    setTimeout(function () {
      toastElement.id = "toast-sleep";
    }, 300);
  }, 1000);
}

function hasNumber(str) {
  return /\d/.test(str);
}

function generateUniqueId() {
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  let str = "";
  for (let i = 0; i < array.length; i++) {
    str += (i < 2 || i > 5 ? "" : "-") + array[i].toString(16).slice(-4);
  }
  return str;
}

function deleteStudent(id) {
  let studentRow = html.querySelector("#aluno_" + id);
  studentRow.remove();

  const studentsData = JSON.parse(localStorage.getItem("studentsData")) || [];
  const updatedStudentsData = studentsData.filter(
    (student) => student.id !== id
  );
  localStorage.setItem("studentsData", JSON.stringify(updatedStudentsData));

  showToast("Aluno(a) removido(a) ✅");
  sendNotification("Removido(a)", "Aluno(a) removido(a) ✅")
}

function editStudent(id) {
  const studentsData = JSON.parse(localStorage.getItem("studentsData")) || [];
  const student = studentsData.find((student) => student.id === id);

  if (student) {
    const allEditButtons = document.querySelectorAll(
      ".material-symbols-outlined.-edit"
    );
    const allDeleteButtons = document.querySelectorAll(
      ".material-symbols-outlined.-delete"
    );

    allEditButtons.forEach((button) => {
      button.style.display = "none";
    });

    allDeleteButtons.forEach((button) => {
      button.style.display = "none";
    });

    btnAddStudent.style.display = "none";
    btnEditStudent.style.display = "block";

    html.querySelector("#name").value = student.name;
    html.querySelector("#n1").value = student.n1;
    html.querySelector("#n2").value = student.n2;

    const editButton = tbody.querySelector(
      `#aluno_${id} .material-symbols-outlined.-edit`
    );
    if (editButton) {
      editButton.style.display = "block";
    }
    editingStudentId = id;
  }
}

function updateStudent() {
  const name = html.querySelector("#name").value;
  let n1 = html.querySelector("#n1").value;
  let n2 = html.querySelector("#n2").value;

  n1 = n1.replace(",", ".");
  n2 = n2.replace(",", ".");

  const nameNumberValidator = hasNumber(name);

  if (name === null || name === "") {
    showToast("Insira um nome ⚠️");
    sendNotification("Nome ⚠️", "Insira um nome ⚠️")
    return
  } else if (nameNumberValidator) {
    showToast("Nome inválido ❌");
    sendNotification("Nome ❌", "Nome inválido ❌")
    return
  } else if (n1 === "" || n2 === "") {
    showToast("Insira todas as notas ⚠️");
    sendNotification("Notas ⚠️", "Insira todas as notas ❌")
    return
  } else if (n1 < 0 || n2 < 0 || n1 > 10 || n2 > 10) {
    showToast("Remova notas maiores que 10 ⚠️");
    sendNotification("Notas ⚠️", "Remova notas maiores que 10 ⚠️")
    return
  } else {
    const studentsData = JSON.parse(localStorage.getItem("studentsData")) || [];
    const studentIndex = studentsData.findIndex(
      (student) => student.id === editingStudentId
    );

    if (studentIndex !== -1 && studentsData[studentIndex]) {
      const existingStudent = studentsData.find(
        (student) =>
          removeSpacesandToLowerCase(student.name) ===
            removeSpacesandToLowerCase(name) && student.id !== editingStudentId
      );

      if (existingStudent) {
        showToast("Este nome já está sendo usado por outro aluno ⚠️");
        sendNotification("Nome⚠️", "Este nome já está sendo usado por outro aluno  ⚠️")
      } else {
        n1 = Number(n1);
        n2 = Number(n2);

        if (isNaN(n1) || isNaN(n2)) {
          showToast("Insira uma nota válida ⚠️");
          sendNotification("Notas ⚠️", "Insira uma nota válida ⚠️")
        } else {
          const average = calcAverage(n1, n2);
          let result = "";

          if (average >= 7 && average <= 10) {
            result = "Aprovado(a)";
          } else if (average < 7) {
            result = "Reprovado(a)";
          }

          studentsData[studentIndex].name = name;
          studentsData[studentIndex].n1 = n1;
          studentsData[studentIndex].n2 = n2;
          studentsData[studentIndex].average = average;
          studentsData[studentIndex].result = result;

          localStorage.setItem("studentsData", JSON.stringify(studentsData));

          const editedStudent = studentsData[studentIndex];
          renderUpdatedStudent(editedStudent);

          showToast("Aluno(a) atualizado(a) ✅");
          sendNotification("Atualizado (a) ✅", "Aluno(a) atualizado(a)✅")


          html.querySelector("#name").value = "";
          html.querySelector("#n1").value = "";
          html.querySelector("#n2").value = "";
          btnAddStudent.style.display = "block";
          btnEditStudent.style.display = "none";
          editingStudentId = null;
          const allEditButtons = document.querySelectorAll(
            ".material-symbols-outlined.-edit"
          );
          const allDeleteButtons = document.querySelectorAll(
            ".material-symbols-outlined.-delete"
          );
          allEditButtons.forEach((button) => {
            button.style.display = "inline-block";
          });
          allDeleteButtons.forEach((button) => {
            button.style.display = "inline-block";
          });
        }
      }
    }
  }
}

function renderUpdatedStudent(student) {
  const editedRow = html.querySelector(`#aluno_${student.id}`);
  editedRow.innerHTML = `<th scope='row' class='th_name-student'> ${student.name} </th> 
                         <td class='td_nota-01'> ${student.n1} </td> 
                         <td class='td_nota-02'> ${student.n2} </td> 
                         <td class='td_media'> ${student.average} </td> 
                         <td class='td_result'> ${student.result} </td>
                         <td class='td_actions'> 
                         <span style='cursor: pointer' class='material-symbols-outlined -delete' onclick='deleteStudent("${
                           student.id
                         }")'>delete</span> 
                         <span style='cursor: pointer' class='material-symbols-outlined -edit' onclick='editStudent("${
                           student.id
                         }")'>edit</span>
                         </tr>`;
}

navigator.serviceWorker.ready.then(function(registration) {
  Notification.requestPermission().then(function(permission) {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    } else {
      console.log('Unable to get permission to notify.');
    }
  });
});

function sendNotification(title, message) {
  navigator.serviceWorker.ready.then(function(registration) {
    registration.showNotification(`${title}`, {
      body: message,
      icon: './icon.png',
    });
  });
}


