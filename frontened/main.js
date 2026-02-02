//создаем массив студентов
let studentsList = [];

//функция возвращет правильную форму слова год, года, лет
function years(age) {
  if (age === 1 || (age % 10 === 1 && age % 100 !== 11)) {
    return 'год'
  } else if (
    (age >= 2 && age <= 4) ||
    (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20))
  ) {
    return 'года'
  } else {
    return 'лет'
  }
}

//создаем функцию вывода одного студента в таблицу
function getStudentItem(student) {
  const fullName = `${student.surname} ${student.name} ${student.lastname}`;

  const currentDate = new Date();

  const birthday = new Date(student.birthday);
  const birthdayStr = birthday.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const age = Math.floor((currentDate - birthday) / (24 * 3600 * 365.25 * 1000));

  const studyStart = student.studyStart;
  const studyEnd = parseInt(student.studyStart) + 4;

  let courseOrFinished;
  if (currentDate.getFullYear() > studyEnd || (currentDate.getFullYear() === studyEnd && currentDate.getMonth() >= 8)) {
    courseOrFinished = 'закончил/а';
  } else {
    const currentCourse = currentDate.getFullYear() - studyStart;
    courseOrFinished = `${currentCourse} курс`
  }

  const tr = document.createElement('tr');

  const tdName = document.createElement('td');
  tdName.textContent = fullName;

  const tdFaculty = document.createElement('td');
  tdFaculty.textContent = student.faculty;

  const tdBirthday = document.createElement('td');
  tdBirthday.className = 'text-center';
  tdBirthday.textContent = `${birthdayStr} (${age}` + ' ' + years(age) + ')';

  const tdStudyYears = document.createElement('td');
  tdStudyYears.className = 'text-center';
  tdStudyYears.textContent = `${studyStart}-${studyEnd} (${courseOrFinished})`;

  const tdDeleteBtn = document.createElement('td');
  const deletBtn = document.createElement('button');
  tdDeleteBtn.className = 'text-center';
  deletBtn.className = 'text-center, btn, btn-danger';
  deletBtn.style.cursor = 'pointer';
  deletBtn.textContent = 'Удалить';

  deletBtn.addEventListener('click', async () => {
    if (confirm(`Вы уверены, что хотите удалить студента ${fullName}?`)) {
      await fetch(`http://localhost:3000/api/students/${student.id}`, {
        method: 'DELETE',
      });

      renderStudentsTable();
    }
  });


  tr.appendChild(tdName);
  tr.appendChild(tdFaculty);
  tr.appendChild(tdBirthday);
  tr.appendChild(tdStudyYears);
  tdDeleteBtn.appendChild(deletBtn);
  tr.appendChild(tdDeleteBtn);

  return tr
}

//создаем функцию вывода всех студентов в таблицу
const tbody = document.getElementById('students-table-body');

async function renderStudentsTable(students = null) {
  tbody.innerHTML = '';

  let studentsData;

  if (students) {
    studentsData = students;
  } else {
    const response = await fetch('http://localhost:3000/api/students');
    studentsData = await response.json();
  }
  studentsData.forEach(student => {
    const studentRow = getStudentItem(student);
    tbody.appendChild(studentRow);
  });
}

renderStudentsTable();

//добавляем слушателя событий отправки формы и валидацию введенных данных.
//добавляем объект с данным сутдентов в массив студентов, если проверка прошла успешна.
//запускаем функцию вывода студентов в таблицу

const form = document.getElementById('student-form');
const formErrors = document.getElementById('form-errors');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const surname = document.getElementById('surname').value.trim();
  const name = document.getElementById('name').value.trim();
  const lastname = document.getElementById('middle-name').value.trim();
  const faculty = document.getElementById('faculty').value.trim();
  const birthday = document.getElementById('birth-date').value.trim();
  const studyStart = parseInt(document.getElementById('start-year').value.trim());


  function formValidation(surname, name, lastname, faculty, birthday, studyStart) {
    const birthdayObj = new Date(birthday);
    const minDate = new Date('1900-01-01');
    const currentDate = new Date();
    const minYear = 2000;

    if (!surname || !name || !lastname || !faculty || !birthday || isNaN(studyStart)) {
      return 'Все поля обязательны для заполнения.';
    }
    if (birthdayObj < minDate || birthdayObj > currentDate) {
      return 'Дата рождения должна быть в диапазоне от 01.01.1900 до текущей даты.';
    }
    if (studyStart < minYear || studyStart > currentDate.getFullYear()) {
      return 'Год начала обучения должен быть в диапазоне от 2000 до текущего года.';
    }
    return null;
  }

  const validatinErrors = formValidation(surname, name, lastname, faculty, birthday, studyStart);

  formErrors.textContent = '';

  if (validatinErrors) {
    formErrors.textContent = validatinErrors;
    return;
  }

  const newStudent = {
    surname,
    name,
    lastname,
    faculty,
    birthday: new Date(birthday).toISOString(),
    studyStart: studyStart.toString(),
  };

  const response = await fetch('http://localhost:3000/api/students', {
    method: 'POST',
    body: JSON.stringify(newStudent),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const studentItem = await response.json();

  studentsList.push(studentItem);

  renderStudentsTable(studentsList);

  form.reset();
});


//создаем функцию сортировки массива
//добавляем события кликов на заголовки таблицы для сортировки по возрастанию и по убыванию
const sortStudents = (arr, prop, dir = false) => arr.sort((a, b) => (!dir ? a[prop] < b[prop] : a[prop] > b[prop]) ? -1 : 0);

const thFullName = document.getElementById('th-full-name');
const thFaculty = document.getElementById('th-faculty');
const thBirthDateAge = document.getElementById('th-birth-date-age');
const thstudyYears = document.getElementById('study-years');

thFullName.style.cursor = 'pointer';
thFaculty.style.cursor = 'pointer';
thBirthDateAge.style.cursor = 'pointer';
thstudyYears.style.cursor = 'pointer';

let sortDir = true;

thFullName.addEventListener('click', async function () {
  const response = await fetch('http://localhost:3000/api/students');
  const students = await response.json();
  students.forEach(student => {
    student.fullName = `${student.surname} ${student.name} ${student.lastname}`;
  });
  sortDir = !sortDir;
  sortStudents(students, 'fullName', sortDir);
  renderStudentsTable(students);
});

thFaculty.addEventListener('click', async function () {
  sortDir = !sortDir;
  const response = await fetch('http://localhost:3000/api/students');
  const students = await response.json();
  sortStudents(students, 'faculty', sortDir);
  renderStudentsTable(students);
});

thBirthDateAge.addEventListener('click', async function () {
  const response = await fetch('http://localhost:3000/api/students');
  const students = await response.json();
  students.forEach(student => {
    student.birthday = new Date(student.birthday);
  });
  sortDir = !sortDir;
  sortStudents(students, 'birthday', sortDir);
  renderStudentsTable(students);
});

thstudyYears.addEventListener('click', async function () {
  const response = await fetch('http://localhost:3000/api/students');
  const students = await response.json();
  sortDir = !sortDir;
  sortStudents(students, 'studyStart', sortDir);
  renderStudentsTable(students);
});

// создаем функцию для фильтрации студентов.
// добавляем события для элементов формы.
function filterArr(arr, prop, value, exactMatch = false) {
  let result = [];
  for (const item of arr) {
    if (exactMatch) {
      if (String(item[prop]) === value) {
        result.push(item);
      }
    } else {
      if (String(item[prop]).toLowerCase().includes(value.toLowerCase())) {
        result.push(item);
      }
    }
  }
  return result;
}

const filterForm = document.getElementById('filter-form');

filterForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const filterName = document.getElementById('filter-name').value.trim();
  const filterFaculty = document.getElementById('filter-faculty').value.trim();
  const filterStartYear = document.getElementById('filter-start-year').value.trim();
  const filterEndYear = document.getElementById('filter-end-year').value.trim();

  const response = await fetch('http://localhost:3000/api/students');
  students = await response.json();

  students.forEach(student => {
    student.fullName = `${student.surname} ${student.name} ${student.lastname}`;
    student.studyEnd = parseInt(student.studyStart) + 4;
  });

  let filteredStudents = students;

  if (!filterName && !filterFaculty && !filterStartYear && !filterEndYear) {
    renderStudentsTable(students);
    return;
  }

  if (filterName !== '') filteredStudents = filterArr(filteredStudents, 'fullName', filterName);
  if (filterFaculty !== '') filteredStudents = filterArr(filteredStudents, 'faculty', filterFaculty);
  if (filterStartYear !== '') filteredStudents = filterArr(filteredStudents, 'studyStart', filterStartYear, true);
  if (filterEndYear !== '') filteredStudents = filterArr(filteredStudents, 'studyEnd', filterEndYear, true);

  renderStudentsTable(filteredStudents);
});
