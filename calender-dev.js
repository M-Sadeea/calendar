// to Do
// - accept user input to go to Date
// - accept anothe input for event.loop


"use strict";
function Cal(el) {
  let months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  let weekDays = ["So", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  let today = new Date();
  let calendar = {};
  // accept HTMLElement or Selector
  if (el instanceof HTMLElement) {
    calendar.wrapper = el;
  } else {
    calendar.wrapper = document.querySelector(el);
  }
  if (!calendar.wrapper) {
    console.log("Calendar Error: Invalid Selector or Element!");
    return false;
  }
  calendar.wrapper.classList.add("calendar-wrapper");
  /*   by Default the first day of the week is Monday  */
  calendar.firstDayInTheWeek = 1;   
  calendar.date = today;
  calendar.events = [];
  calendar.specialClasses = [];
  /* give today's Date a special class */
  setDayClass({ date: today, class: "today" });
  renderCalendar();
  let cal = {
    el: _=> calendar.wrapper,
    refresh: _ => {
        calendar.builded = false;
        renderCalendar()
    },
    prevMonth: _ => goToMonth("prev"),
    nextMonth: _ => goToMonth("next"),
    setFirstDayInTheWeek: n => {
      if (isNaN(n) || n>6 || n<0) return;
      calendar.firstDayInTheWeek = n;
      calendar.builded= false;
      renderCalendar();
    },
    addEvent: (obj, refresh )=> {
      let id = addEvent(obj);
      if (refresh) renderCalendar();
      return id;
    },
    removeEvent: (ids, refresh) => {
      removeEvent(ids);
      if (refresh) renderCalendar();
    },
    clearEvents: (refresh) => {
      calendar.events = [];
      if (refresh) renderCalendar();
    },
    setDayClass: (obj,refresh) => {
      setDayClass(obj);
      if (refresh) renderCalendar();
    },
    removeSpecialDayClass: (obj, refresh) => {
      removeSpecialDayClass(obj);
      if (refresh) renderCalendar();
    },
    clearAllSpecialClasses: (refresh) => {
      calendar.specialClasses = [];
      if (refresh) renderCalendar();
    },
    goToDate: goToDate
  };

  return cal;

  function renderCalendar() {
    if(calendar.builded==true) {
        updateMonthName();
        calendar.wrapper.removeChild(calendar.daysWrapper);
    } else {
        calendar.wrapper.innerHTML = "";
        fillMonthName();
        fillDaysNames();
    }
    updateDays();
    fillDays();
  }

  function goToDate(d) {
    let dt = checkDate(d);
    if (dt) {
      calendar.date = dt;
      renderCalendar();
    }
  }

  function goToMonth(dir) {
    let M = calendar.date.getMonth();
    let d = dir == "next" ? M + 1 : dir == "prev" ? M - 1 : null;
    if (d === null) return;
    calendar.date = new Date(calendar.date.getFullYear(), d, 1);
    renderCalendar();
  }

  function updateDays() {
    let date = calendar.date;
    let thisYear = date.getFullYear();
    let thisMonth = date.getMonth();
    let thisMonthLength = (new Date( thisYear, thisMonth + 1, 0 )).getDate();
    let lastMonthLength = (new Date( thisYear, thisMonth, 0 )).getDate();
    let firstDayInMonth = (new Date( thisYear, thisMonth, 1 )).getDay();
    if (firstDayInMonth - calendar.firstDayInTheWeek >= 0) {
      firstDayInMonth = firstDayInMonth - calendar.firstDayInTheWeek;
    } else {
      firstDayInMonth = 7 + firstDayInMonth - calendar.firstDayInTheWeek;
    }
    let days = [];
    // fill days from the previous month
    for (let i = firstDayInMonth; i > 0; i--) {
      days.push({
        day: lastMonthLength - i + 1,
        month: thisMonth - 1 < 0 ? 11 : thisMonth - 1,
        year: thisMonth !== 0 ? thisYear : thisYear - 1,
        class: "prev-month"
      });
    }
    // fill current month days
    for (let i = 1; i <= thisMonthLength; i++) {
      days.push({
        day: i,
        month: thisMonth,
        year: thisYear,
        class: "this-month"
      });
    }
    // fill days from the previous month
    for (let i = 0; i < days.length % 7; i++) {
      days.push({
        day: i + 1,
        month: (thisMonth + 1) % 12,
        year: thisMonth !== 11 ? thisYear : thisYear + 1,
        class: "next-month"
      });
    }
    calendar.days = days;
  }

  function fillMonthName() {
    let div = document.createElement("div");
    div.classList.add("month-name-wrapper");
    let btn_prev = document.createElement("button");
    let btn_next = document.createElement("button");
    let text = document.createElement("span");
    btn_prev.innerText = "prev";
    btn_prev.classList.add("btn-prev-month");
    btn_next.classList.add("btn-next-month");
    btn_next.innerText = "next";
    div.appendChild(btn_prev);
    div.appendChild(text);
    div.appendChild(btn_next);
    calendar.wrapper.appendChild(div);
    btn_next.addEventListener("click", _ => goToMonth("next"));
    btn_prev.addEventListener("click", _ => goToMonth("prev"));
    calendar.monthName = text;
    updateMonthName();
    calendar.builded = true;
  }

  function updateMonthName(){
    calendar.monthName.innerHTML = months[calendar.date.getMonth()] + " / " + calendar.date.getFullYear();
  }

  function fillDaysNames() {
    let div = document.createElement("div");
    div.classList.add("days-names-wrapper");
    let j = calendar.firstDayInTheWeek;
    for (let i = 0; i < 7; i++) {
      let day = document.createElement("div");
      day.classList.add("day-name");
      day.innerHTML = weekDays[j];
      div.appendChild(day);
      if (j >= 6) {
        j = 0;
      } else {
        j++;
      }
    }
    calendar.daysNameWrapper = div;
    calendar.wrapper.appendChild(div);
  }

  function fillDays() {
    let div = document.createElement("div");
    div.classList.add("days-wrapper");
    for (let i = 0; i < calendar.days.length; i++) {
      let day = document.createElement("div");
      day.classList.add("day");
      day.setAttribute(
        "title",
        calendar.days[i].year + "-" + (calendar.days[i].month + 1) + "-" + calendar.days[i].day
      );
      day.innerHTML = calendar.days[i].day;
      day.classList.add(calendar.days[i].class);
      let specialDates = getDayClasses(calendar.days[i]);
      if (specialDates.day.length) {
        for (let j = 0; j < specialDates.day.length; j++) {
          let cls = specialDates.day[j];
          if (Array.isArray(cls)) {
            for (let k = 0; k < cls.length; k++) {
              day.classList.add(cls[k]);
            }
          } else {
            day.classList.add(cls);
          }
        }
      }
      if (specialDates.events.length) {
        let spanCont = document.createElement("span");
        spanCont.classList.add("event-container");
        for (let j = 0; j < specialDates.events.length; j++) {
          let span = document.createElement("span");
          let cls = specialDates.events[j].class;
          if (Array.isArray(cls)) {
            for (let k = 0; k < cls.length; k++) {
              span.classList.add(cls[k]);
            }
          } else {
            span.classList.add(cls);
          }
          if (specialDates.events[j].tip)
            span.setAttribute("data-cal-tip", specialDates.events[j].tip);
          else 
            span.classList.add('event-without-tip');
          spanCont.appendChild(span);
        }
        day.appendChild(spanCont);
      }
      div.appendChild(day);
    }
    calendar.daysWrapper = div;
    calendar.wrapper.appendChild(div);
  }

  function addEvent(evnts) {
    let workArray = getArgsArray(evnts);
    let eventsIds = [];
    for (let i = 0; i < workArray.length; i++) {
      let obj = workArray[i];
      let dt = checkDate(obj);
      if (!dt) continue;
      let clss = obj.class || "";
      let sd = {
        id: generateID(dt),
        date: dt,
        class: clss
      };
      if (obj.tip) sd.tip = obj.tip;
      if (obj.loop) sd.loop = obj.loop;
      calendar.events.push(sd);
      eventsIds.push(sd.id);
    }
    if (eventsIds.length == 1) {
      return eventsIds[0];
    } else {
      return eventsIds;
    }
  }

  function removeEvent(ids) {
    if (Array.isArray(ids)) {
      for (let i = 0; i < ids.length; i++) {
        removeOneEvent(ids[i]);
      }
    } else {
      removeOneEvent(ids);
    }
  }

  function removeOneEvent(id) {
    for (let i = calendar.events.length - 1; i >= 0; i--) {
      if (id == calendar.events[i].id) calendar.events.splice(i, 1);
    }
  }

  function setDayClass(args) {
    let workArray = getArgsArray(args);
    for (let i = 0; i < workArray.length; i++) {
      let obj = workArray[i];
      if (!obj.class) continue;
      let dt = checkDate(obj);
      if (!dt) continue;
      calendar.specialClasses.push({ date: dt, class: obj.class });
    }
  }

  function removeSpecialDayClass(args) {
    let workArray = getArgsArray(args);
    for (let i = 0; i < workArray.length; i++) {
      removeOneSpecialDayClass(workArray[i]);
    }
  }

  function removeOneSpecialDayClass(d) {
    let dt;
    let removeClasses = true;
    if (typeof d === "string") {
      dt = checkDate(d);
    } else if (d.date) {
      dt = checkDate(d.date);
      if (d.class) removeClasses = getArgsArray(d.class);
    }
    if (!dt) return;
    for (let i = calendar.specialClasses.length - 1; i >= 0; i--) {
      if (dt.getTime() == calendar.specialClasses[i].date.getTime()) {
        if (removeClasses == true) {
          calendar.specialClasses.splice(i, 1);
        } else {
          for (let j = 0; j < removeClasses.length; j++) {
            if (typeof calendar.specialClasses[i].class == "string") {
              if (calendar.specialClasses[i].class == removeClasses[j])
                calendar.specialClasses.splice(i, 1);
            } else if (Array.isArray(calendar.specialClasses[i].class)) {
              let index = calendar.specialClasses[i].class.indexOf(removeClasses[j]);
              if (isNaN(index)) continue;
              calendar.specialClasses[i].class.splice(index, 1);
            }
          }
        }
      }
    }
  }

  function getDayClasses(date) {
    let event_classes = [];
    let day_classes = [];
    let d = new Date(date.year, date.month, date.day);
    d = d.getTime();
    for (let i = 0; i < calendar.events.length; i++) {
      let curr = calendar.events[i];
      let eventTime = curr.date.getTime();
      if (curr.loop) {
        switch (curr.loop.toLowerCase()) {
          case "month":
            eventTime = new Date(date.year, date.month, curr.date.getDate());
            break;
          case "year":
            eventTime = new Date(
              date.year,
              curr.date.getMonth(),
              curr.date.getDate()
            );
            break;
          default:
            eventTime = curr.date;
        }
        eventTime = eventTime.getTime();
      }
      if (eventTime == d) {
        let clsArr = ["calendar-event"];
        if (curr.class) {
          if (Array.isArray(curr.class)) {
            clsArr = clsArr.concat(curr.class);
          } else {
            clsArr.push(curr.class);
          }
        }
        let obj = {
          class: clsArr
        };
        if (curr.tip) obj.tip = curr.tip;
        event_classes.push(obj);
      }
    }
    for (let i = 0; i < calendar.specialClasses.length; i++) {
      let curr = calendar.specialClasses[i];
      let dt = curr.date instanceof Date ? curr.date : new Date(curr.date);
      if (dt.getTime() == d) {
        day_classes.push(curr.class);
      }
    }
    return { events: event_classes, day: day_classes };
  }

  function getArgsArray(inObj) {
    let workArray = [];
    if (!Array.isArray(inObj)) {
      workArray.push(inObj);
    } else {
      workArray = inObj;
    }
    return workArray;
  }

  function checkDate(obj) {
    let dt = obj.date || obj;
    if (dt instanceof Date) {
      dt = dt;
    } else {
      dt = new Date(dt);
    }
    if (isNaN(dt)) return false;
    dt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    return dt;
  }

  function generateID(dt) {
    return (
      Math.floor((Math.random() + 1) * 1000) +
      "" +
      dt.getFullYear() +
      dt.getMonth() +
      dt.getDate()
    );
  }
}
