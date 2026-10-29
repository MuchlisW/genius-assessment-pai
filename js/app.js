(function () {
  "use strict";

  const DURATION = 30 * 60;
  const LETTERS = ["A", "B", "C", "D"];
  const $ = (id) => document.getElementById(id);

  const state = {
    student: null,
    questions: [],
    index: 0,
    answers: [],
    startTime: 0,
    timerId: null,
    finished: false
  };

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function showPage(id) {
    ["startPage", "quizPage", "resultPage"].forEach((page) => {
      $(page).hidden = page !== id;
    });
    window.scrollTo(0, 0);
  }

  function validateData() {
    if (typeof ASSESSMENT === "undefined" || !Array.isArray(ASSESSMENT.questions)) {
      throw new Error("Data soal tidak ditemukan.");
    }
    if (ASSESSMENT.questions.length !== 25) {
      throw new Error("Jumlah soal harus 25.");
    }
    ASSESSMENT.questions.forEach((q) => {
      const keys = Object.keys(q.options || {});
      if (keys.length !== 4 || !q.options[q.correct_answer]) {
        throw new Error("Data soal nomor " + q.id + " tidak lengkap.");
      }
    });
  }

  function initStartPage() {
    $("subjectInfo").textContent = ASSESSMENT.subject + " · Kelas " + ASSESSMENT.grade;
    $("metaInfo").textContent = ASSESSMENT.school + " · 25 soal pilihan ganda · 30 menit";

    $("startForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const nama = $("nama").value.trim().replace(/\s+/g, " ");
      const nis = $("nis").value.trim();
      const kelas = $("kelas").value.trim().replace(/\s+/g, " ");

      const valid = {
        nama: /\p{L}.*\p{L}/u.test(nama) && nama.length <= 60,
        nis: /^[0-9./ -]{1,20}$/.test(nis) && /\d/.test(nis),
        kelas: kelas.length > 0 && kelas.length <= 20
      };

      Object.keys(valid).forEach((field) => {
        $(field).classList.toggle("is-invalid", !valid[field]);
      });

      const firstInvalid = Object.keys(valid).find((field) => !valid[field]);
      if (firstInvalid) {
        $(firstInvalid).focus();
        return;
      }
      startAssessment({ nama, nis, kelas });
    });

    ["nama", "nis", "kelas"].forEach((field) => {
      $(field).addEventListener("input", () => $(field).classList.remove("is-invalid"));
    });
  }

  function startAssessment(student) {
    state.student = student;
    state.questions = shuffle(ASSESSMENT.questions).map((q) => ({
      topic: q.topic,
      question: q.question,
      explanation: q.explanation,
      options: shuffle(
        Object.keys(q.options).map((key) => ({
          text: q.options[key],
          isCorrect: key === q.correct_answer
        }))
      )
    }));
    state.answers = new Array(state.questions.length).fill(null);
    state.index = 0;
    state.finished = false;
    state.startTime = Date.now();

    $("timerBox").hidden = false;
    updateTimer();
    state.timerId = setInterval(updateTimer, 1000);
    window.addEventListener("beforeunload", warnBeforeLeave);

    showPage("quizPage");
    renderQuestion();
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const remaining = Math.max(0, DURATION - elapsed);
    $("timer").textContent = formatTime(remaining);
    $("timerBox").classList.toggle("warning", remaining <= 60);
    if (remaining === 0) {
      finishAssessment(true);
    }
  }

  function warnBeforeLeave(event) {
    if (!state.finished) {
      event.preventDefault();
      event.returnValue = "";
    }
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    const area = $("questionArea");
    area.classList.remove("fade-in");
    void area.offsetWidth;
    area.classList.add("fade-in");

    $("qCounter").textContent = "Soal " + (state.index + 1) + " dari " + state.questions.length;
    $("qTopic").textContent = q.topic;
    $("qText").textContent = q.question;

    const container = $("options");
    container.replaceChildren();
    q.options.forEach((option, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "opt-btn";

      const letter = document.createElement("span");
      letter.className = "letter";
      letter.textContent = LETTERS[i];

      const text = document.createElement("span");
      text.textContent = option.text;

      button.append(letter, text);
      button.addEventListener("click", () => selectAnswer(i));
      container.appendChild(button);
    });

    $("feedback").hidden = true;
    $("nextBtn").hidden = true;
    updateProgress();
  }

  function selectAnswer(choice) {
    if (state.finished || state.answers[state.index] !== null) {
      return;
    }

    const q = state.questions[state.index];
    const correctIndex = q.options.findIndex((option) => option.isCorrect);
    const isCorrect = choice === correctIndex;
    state.answers[state.index] = { choice, isCorrect };

    $("options").querySelectorAll(".opt-btn").forEach((button, i) => {
      button.disabled = true;
      if (i === correctIndex) {
        button.classList.add("correct");
      } else if (i === choice) {
        button.classList.add("wrong");
      }
    });

    showFeedback(q, isCorrect, correctIndex);

    const next = $("nextBtn");
    next.textContent = state.index === state.questions.length - 1 ? "Lihat Hasil 🏁" : "Soal Berikutnya ➜";
    next.hidden = false;
    updateProgress();
  }

  function showFeedback(q, isCorrect, correctIndex) {
    const box = $("feedback");
    box.replaceChildren();
    box.className = "feedback " + (isCorrect ? "good" : "bad");

    const emoji = document.createElement("div");
    emoji.className = "fb-emoji text-center";

    if (isCorrect) {
      emoji.textContent = "😄🎉";
      const title = document.createElement("div");
      title.className = "fb-title";
      title.textContent = "GOOD JOB";
      box.append(emoji, title);
      box.hidden = false;
      return;
    }

    emoji.textContent = "😢";
    const answer = document.createElement("p");
    answer.className = "mb-2";
    const answerLabel = document.createElement("strong");
    answerLabel.textContent = "Jawaban yang benar: " + LETTERS[correctIndex] + ". ";
    answer.append(answerLabel, q.options[correctIndex].text);

    const explanation = document.createElement("p");
    explanation.className = "mb-0";
    const explanationLabel = document.createElement("strong");
    explanationLabel.textContent = "Pembahasan: ";
    explanation.append(explanationLabel, q.explanation);

    box.append(emoji, answer, explanation);
    box.hidden = false;
  }

  $("nextBtn").addEventListener("click", () => {
    if (state.answers[state.index] === null) {
      return;
    }
    if (state.index < state.questions.length - 1) {
      state.index++;
      renderQuestion();
    } else {
      finishAssessment(false);
    }
  });

  function updateProgress() {
    const total = state.questions.length;
    const answered = state.answers.filter((a) => a !== null).length;
    $("progressBar").style.width = (answered / total) * 100 + "%";
    $("qProgress").textContent = answered + " dari " + total + " dijawab";

    const numbers = $("navNumbers");
    numbers.replaceChildren();
    state.answers.forEach((answer, i) => {
      const item = document.createElement("span");
      item.textContent = i + 1;
      if (i === state.index) {
        item.className = "current";
      } else if (answer !== null) {
        item.className = "answered";
      }
      numbers.appendChild(item);
    });
  }

  function finishAssessment(timeUp) {
    if (state.finished) {
      return;
    }
    state.finished = true;
    clearInterval(state.timerId);
    window.removeEventListener("beforeunload", warnBeforeLeave);
    $("timerBox").hidden = true;

    const total = state.questions.length;
    const correct = state.answers.filter((a) => a && a.isCorrect).length;
    const wrong = total - correct;
    const unanswered = state.answers.filter((a) => a === null).length;
    const score = Math.round((correct / 25) * 100);
    const used = Math.min(DURATION, Math.floor((Date.now() - state.startTime) / 1000));

    $("rNama").textContent = state.student.nama;
    $("rNis").textContent = state.student.nis;
    $("rKelas").textContent = state.student.kelas;
    $("rBenar").textContent = correct + " soal";
    $("rSalah").textContent = wrong + " soal" + (unanswered ? " (" + unanswered + " tidak dijawab)" : "");
    $("rNilai").textContent = score;
    $("rWaktu").textContent = Math.floor(used / 60) + " menit " + (used % 60) + " detik";
    $("finalScore").textContent = score;
    document.querySelector(".score-circle").style.setProperty("--p", score + "%");
    $("resultNote").textContent = timeUp
      ? "⏰ Waktu habis. Asesmen dihentikan otomatis."
      : "Asesmen selesai dikerjakan.";

    let emoji, message, style;
    if (score >= 90) {
      emoji = "🏆";
      style = "alert-success";
      message = "Sangat baik! Pemahamanmu tentang materi PAI sangat kuat. Pertahankan dan amalkan dalam kehidupan sehari-hari.";
    } else if (score >= 75) {
      emoji = "😄";
      style = "alert-primary";
      message = "Baik! Sebagian besar materi sudah kamu kuasai. Perhatikan kembali pembahasan pada soal yang belum tepat.";
    } else if (score >= 60) {
      emoji = "🙂";
      style = "alert-warning";
      message = "Cukup. Kamu sudah memahami sebagian materi. Fokuskan latihan pada topik yang jawabannya belum tepat.";
    } else {
      emoji = "💪";
      style = "alert-warning";
      message = "Tetap semangat! Diskusikan topik yang belum tepat bersama guru agar pemahamanmu semakin kuat.";
    }

    $("resultEmoji").textContent = emoji;
    const feedback = $("resultFeedback");
    feedback.className = "alert mb-3 " + style;
    feedback.textContent = message;

    showPage("resultPage");
  }

  $("restartBtn").addEventListener("click", () => {
    $("startForm").reset();
    showPage("startPage");
  });

  try {
    validateData();
    initStartPage();
  } catch (error) {
    const main = document.querySelector("main");
    main.replaceChildren();
    const alert = document.createElement("div");
    alert.className = "alert alert-danger";
    alert.textContent = "Terjadi kesalahan: " + error.message;
    main.appendChild(alert);
  }
})();
