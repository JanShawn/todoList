/* MVC
  Model      =>資料邏輯
  View       =>畫面
  Controller =>分配工作
*/
/* 資料格式
 listData:[
    { sn:0, completed: bool ,todoText: string, type:string,   deadline: string }
 ]
*/
//*-----Function-----*//
function getTimeRemaining(endtime) {
  //取得剩餘時間
  const total = Date.parse(endtime) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}
function getRenderContent(obj) {
  //取得渲染內容
  var result = {};
  var typeTxt = '';
  var remainTime = getTimeRemaining(obj.deadline); //取得剩餘時間
  switch (obj.type) {
    case 'emergent_Important':
      typeTxt = '緊急重要';
      break;
    case 'emergent_N-Important':
      typeTxt = '緊急不重要';
      break;
    case 'N-emergent_Important':
      typeTxt = '不緊急重要';
      break;
    case 'N-emergent_N-Important':
      typeTxt = '不緊急不重要';
      break;
  }
  result.typeText = `<td>${typeTxt}</td>`;
  result.toggle = '<button class="btn btn-outline-success complete">完成</button>';
  if (obj.completed) {
    result.degreeImg = '<img src="img/ok.png">';
    result.remainTime = '<span class="success">已完成!</span>';
    result.toggle = '<button class="btn btn-success complete">取消完成</button>';
  } else if (!obj.completed && remainTime.total > 0) {
    var degree = '';
    var deadline = Date.parse(obj.deadline);
    var currentTime = new Date().getTime();
    var day = parseInt(Math.ceil((deadline - currentTime) / 1000 / 60 / 60 / 24)); // 把相差的毫秒數轉換為天數
    switch (day) {
      //程度(3天以上->1火,2天->2火,1天->3火)
      case 0:
      case 1:
        degree = `<img src="img/fire.png"><img src="img/fire.png"><img src="img/fire.png">`;
        break;
      case 2:
        degree = `<img src="img/fire.png"><img src="img/fire.png">`;
        break;
      default:
        degree = `<img src="img/fire.png">`;
        break;
    }
    result.degreeImg = `${degree}`;
    result.remainTime = deadline - currentTime;
  } else {
    //失敗
    result.degreeImg = `<img src="img/fail.png">`;
    result.remainTime = `<span class="fail">過期啦!</span>`;
  }
  return result;
}
function getActiveList() {
  //處理篩選清單
  var resultList = [];
  var activeSpan = null; //篩選的標籤
  var typeSpan = document.querySelectorAll('.taskType>span'); //對象
  typeSpan.forEach((span) => {
    if (span.classList.contains('active')) activeSpan = span;
  });
  if (activeSpan.dataset.type == 'all') {
    resultList = todosModal.todoList;
  } else {
    resultList = todosModal.todoList.filter((todo) => todo.type == activeSpan.dataset.type);
  }
  return resultList;
}

//*-----Modal-----*//
var todosModal = {
  todoList: JSON.parse(localStorage.getItem('listData')) || [], //清單陣列
  addTodo: function (todoObj) {
    //新增清單代辦事項
    this.todoList.push(todoObj);
    //localStorage
    todosModal.setLocalStorage(this.todoList);
  },
  changeTodo: function (sn, todoObj) {
    //修改清單代辦事項
    var index = this.todoList.findIndex((todo) => todo.sn == sn);
    this.todoList[index] = todoObj;
    //localStorage
    todosModal.setLocalStorage(this.todoList);
  },
  deleteTodo: function (sn) {
    //刪除清單代辦事項
    var index = this.todoList.findIndex((todo) => todo.sn == sn);
    this.todoList.splice(index, 1);
    //localStorage
    todosModal.setLocalStorage(this.todoList);
  },
  toggleTodo: function (sn) {
    //更改清單狀態
    var index = this.todoList.findIndex((todo) => todo.sn == sn);
    this.todoList[index].completed = !this.todoList[index].completed;
    //localStorage
    todosModal.setLocalStorage(this.todoList);
  },
  setLocalStorage: function (todoList) {
    //localStorage
    data = JSON.stringify(todoList);
    localStorage.setItem('listData', data);
  },
};
//*-----controller-----*//
var controller = {
  addTodo: function (todoObj) {
    todosModal.addTodo(todoObj); //insert localStorage
    view.displayTodos(todosModal.todoList, todoObj.sn); //刷新table
  },
  changeTodo: function (sn, todoObj) {
    todosModal.changeTodo(sn, todoObj); //insert localStorage
    view.displayTodos(todosModal.todoList, todoObj.sn);
  },
  deleteTodo: function (sn) {
    todosModal.deleteTodo(sn);
    view.displayTodos(todosModal.todoList);
  },
  toggleTodo: function (sn) {
    todosModal.toggleTodo(sn);
  },
};
//*-----view-----*//
var view = {
  displayTodos: function (list, sn) {
    //sn->編輯||新增的sn
    var tbody = document.querySelector('#tableTbody');
    tbody.innerHTML = ''; //清空
    var todo = list;
    var totalTr = '<tr data-content="none"><td colspan="6" class="nothingTodo">無待辦事項</td></tr>';
    if (todo.length != 0) {
      totalTr = todo
        .sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))
        .map((obj, index) => {
          var renderContent = getRenderContent(obj);
          return (
            `<tr data-index="${index}" data-sn="${obj.sn}" >` +
            `${renderContent.typeText}` + //種類
            `<td>${renderContent.degreeImg}</td>` + //緊急程度
            `<td>${obj.todoText}</td>` + //名稱
            `<td>${moment(obj.deadline).format('YYYY/MM/DD<br>(Ahh:mm)')}</td>` + //預計完成日期
            `<td data-deadlne="${obj.deadline}"></td>` + //剩餘時間
            `<td>
          ${renderContent.toggle}
          <button class="d-${!obj.completed ? 'inline' : 'none'} btn  btn-outline-dark edit"><i class="fa fa-pencil fa-lg" aria-hidden="true"></i></button>
          <button class="btn btn-outline-danger trashCan"><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button>
          </td>` +
            `</tr>`
          );
        })
        .join('');
    }
    tbody.innerHTML = totalTr;
    //給予Tr所需要的監聽
    view.setTrEventHandler();
    //twinkl閃爍
    if (sn) {
      //獲取更改目標
      var aimTarget = null;
      document.querySelectorAll('#tableTbody>tr').forEach((tr) => {
        if (tr.dataset.sn == sn) aimTarget = tr;
      });
      //移動到目標
      var todos = document.querySelector('#todos');
      var scrollTo = aimTarget.offsetTop;
      todos.scrollTop = scrollTo;
      //給閃爍效果
      aimTarget.style.animation = 'twinkl  .8s ease-in-out 10';
      setTimeout(() => {
        document.querySelector('.todoTable').scrollTop = 100;
        aimTarget.style.animation = '';
      }, 3000);
    }
  },
  setTrEventHandler: function () {
    //給tr中按鈕事件
    // completeBtn 完成按鈕
    var completes = document.querySelectorAll('.complete'); //對象
    completes.forEach((btn) => {
      //事件
      btn.addEventListener('click', function (e) {
        var activeList = getActiveList();
        var target = e.target;
        var todoTr = target.parentNode.parentNode;
        var trIndex = todoTr.dataset.index;
        var trObj = activeList[trIndex];
        //setlocalStorage
        controller.toggleTodo(trObj.sn);
        //cheangeRender
        var editBtn = e.target.nextElementSibling;
        if (trObj.completed) {
          target.classList.remove('btn-outline-success');
          target.classList.add('btn-success');
          editBtn.classList.remove('d-inline');
          editBtn.classList.add('d-none');
        } else {
          target.classList.remove('btn-success');
          target.classList.add('btn-outline-success');
          editBtn.classList.remove('d-none');
          editBtn.classList.add('d-inline');
        }
        target.innerText = target.innerText == '完成' ? '取消完成' : '完成';
        var degreeTd = todoTr.children[1]; //緊急程度
        var remainTd = todoTr.children[4]; //剩餘時間
        var renderConten = getRenderContent(todosModal.todoList[trIndex]);
        remainTd.innerHTML = '';
        degreeTd.innerHTML = renderConten.degreeImg;
      });
    });
    //編輯按鈕
    var edits = document.querySelectorAll('.edit'); //對象
    edits.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        var activeList = getActiveList();
        var target = e.target;
        var todoTr = target.className.indexOf('fa') >= 0 ? target.parentNode.parentNode.parentNode : target.parentNode.parentNode;
        var trIndex = +todoTr.dataset.index;
        document.querySelector('.todoForm').classList.add('todoForm-show'); //表單顯示
        var todoObj = activeList[trIndex];
        view.showTodoForm('edit', todoObj);
      });
    });
    //deleteTrash 垃圾桶按鈕
    var trashCans = document.querySelectorAll('.trashCan'); //對象
    trashCans.forEach((btn) => {
      //事件
      btn.addEventListener('click', function (e) {
        var activeList = getActiveList();
        var target = e.target;
        var todoTr = target.className.indexOf('fa') >= 0 ? target.parentNode.parentNode.parentNode : target.parentNode.parentNode;
        var trIndex = todoTr.dataset.index;
        var todoObj = activeList[trIndex];
        Swal.fire({
          icon: 'warning',
          title: '你確定要刪除嗎?',
          text: '刪除之後不可復原喔!',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
          if (result.isConfirmed) {
            // 刪除按鈕 //?需要問的地方
            controller.deleteTodo(
              todoObj.sn,
              Swal.fire({
                title: '刪除!',
                text: '代辦事項已被刪除.',
                icon: 'success',
              })
                .then((result) => {
                  if (result.isConfirmed) view.displayTodos(todosModal.todoList); //刷新table
                })
                .then(() => view.initReset())
            );
          }
        });
      });
    });
  },
  showAlert: function (icon, title, msg) {
    //跳錯誤
    return Swal.fire({
      icon: icon,
      title: title,
      html: msg,
      confirmButtonText: 'OK',
    });
  },
  showTodoForm: function (type, obj) {
    document.querySelector('.todoForm').classList.add('todoForm-show'); //表單顯示
    document.querySelector('.finishLabel').innerHTML = type == 'add' ? '預計完成日期' : '預計完成日期<span style="color:red">(如果事件過期只能以當下時間往後做修改)</span>';
    if (type == 'add') {
      document.querySelector('#todoTitle').setAttribute('readonly', true);
    } else {
      document.querySelector('#todoTitle').removeAttribute('readonly');
    }
    //設定資料
    document.querySelector('#todoTitle').value = obj.todoText;
    var overTime = Date.parse(obj.deadline) - Date.parse(new Date());
    //設定當下時間不能低於此時間之前(如果事件過期以當下時間，未過期以未過期時間)
    $('#completeDate')
      .data('DateTimePicker')
      .date(overTime > 0 ? new Date(obj.deadline) : new Date());
    document.querySelector('#todoType').value = obj.type || 'emergent_Important';
    //設定按鈕字樣
    var submit = document.querySelector('#submitTodo');
    submit.innerHTML = type == 'add' ? '新增' : '修改';
    //給予todo屬性(sn位置)
    submit.sn = obj.sn;
  },
  initReset() {
    //其他處理
    document.querySelector('.todoForm').classList.remove('todoForm-show'); //表單隱藏
    document.querySelector('.addTodoTxt').value = ''; //新增欄位清空
    //切回「全部」
    var typeSpan = document.querySelectorAll('.taskType>span'); //對象
    typeSpan.forEach((type) => {
      type.dataset.type == 'all' ? type.classList.add('active') : type.classList.remove('active');
    });
  },
};

//*-----監聽-----*//

//taskType(種類選擇)
var typeSpan = document.querySelectorAll('.taskType>span'); //對象
typeSpan.forEach((span) =>
  span.addEventListener('click', function (e) {
    //事件
    //css
    typeSpan.forEach((type) => {
      type.dataset.type == e.target.dataset.type ? type.classList.add('active') : type.classList.remove('active');
    });
    if (e.target.dataset.type == 'all') {
      view.displayTodos(todosModal.todoList);
    } else {
      var filterList = todosModal.todoList.filter((todo) => todo.type == e.target.dataset.type);
      view.displayTodos(filterList);
    }
  })
);

//addNewBtn(新增待辦右邊+)
document.querySelector('#addNewBtn').addEventListener('click', function (e) {
  var addTxtDom = document.querySelector('.addTodoTxt');
  if (!addTxtDom.value) return view.showAlert('error', '新增失敗', '請輸入待辦內容!');
  view.showTodoForm('add', { sn: 0, todoText: addTxtDom.value });
});

//彈窗關閉
document.querySelector('.close').addEventListener('click', function (e) {
  document.querySelector('.todoForm').classList.remove('todoForm-show');
});

//submitTodo(新增/修改按鈕)
document.querySelector('#submitTodo').addEventListener('click', function (e) {
  var submit = e.target;
  var todo = document.querySelector('#todoTitle').value;
  var date = document.querySelector('#completeDate').date || $('#completeDate').data('DateTimePicker').date()._d;
  var type = document.querySelector('#todoType').value;
  var todoObj = {
    completed: false,
    todoText: todo,
    type: type,
    deadline: date,
    sn: submit.sn,
  };
  if (todoObj.sn == 0) {
    //sn=0表示新增
    if (todosModal.todoList.length == 0) todoObj.sn = 1;
    //賦予sn，缺少的會回補。ex.sn剩下1,3，當新增時沒有2，sn會補回2，sn都有時才會開始遞增。
    var sortList = todosModal.todoList.sort((a, b) => a.sn - b.sn); //由小到大排序
    for (let index = 0; index < sortList.length; index++) {
      const obj = todosModal.todoList[index];
      if (obj.sn == todosModal.todoList.length) {
        todoObj.sn = obj.sn + 1;
        break;
      } else {
        if (obj.sn != index + 1) {
          todoObj.sn = index + 1;
          break;
        }
      }
    }
    controller.addTodo(todoObj);
  } else {
    //修改
    controller.changeTodo(todoObj.sn, todoObj);
  }
  view.initReset();
});

// delete(刪除按鈕) -> 在sweetAlert

//*-----init 初始化-----*//
$('#completeDate')
  .datetimepicker({
    format: 'YYYY/MM/DD (Ahh:mm)',
    showTodayButton: true,
  })
  .on('dp.show', function (e) {
    //設定當下時間不能低於此時間之前
    $('#completeDate').data('DateTimePicker').minDate(new Date());
  })
  .on('dp.hide', function (e) {
    //紀錄時間
    document.querySelector('#completeDate').date = e.date._d;
  });

//剩餘時間計算(每秒更新)
setInterval(function () {
  // 設置倒數計時: 結束時間 - 當前時間
  var trList = document.querySelectorAll('#tableTbody>tr'); //取出所有tr
  if (trList.length > 0 && trList[0].dataset.content != 'none') {
    trList.forEach((tr) => {
      var index = tr.dataset.index; //第幾筆
      var degreeTd = tr.children[1]; //緊急程度
      var remainTd = tr.children[4]; //剩餘時間
      var remainTime = getTimeRemaining(remainTd.dataset.deadlne);
      var activeList = getActiveList();
      var trObj = activeList[index];
      if (trObj) {
        var renderContent = getRenderContent(trObj);
        if (!trObj.completed && remainTime.total > 0) {
          remainTxt = `<td>${remainTime.days}天${remainTime.hours}小時<br>${remainTime.minutes}分${remainTime.seconds}秒</td>`;
        } else {
          remainTxt = renderContent.remainTime;
        }
        if (degreeTd.innerHTML != renderContent.degreeImg) degreeTd.innerHTML = renderContent.degreeImg;
        if (remainTd.innerHTML != remainTxt) remainTd.innerHTML = remainTxt;
      }
    });
  }
}, 1000);

view.displayTodos(todosModal.todoList);
