<template>
  <div id="Page">
    <img class="logo" :src="LogoSmall" alt="logo" @click="() => $router.push('/')" />

    <div class="title">
      <img class="arrow" src="../assets/arrow.png" alt="arrow" @click.prevent="goToGameMenu()" />
      <h2>{{quiz_name}}</h2>
      <img class="quiz_img" :src="quiz_image" alt="quiz_image" />
    </div>

    <div class="QuizArea">
      <QuizAreaCTF v-if="vue>=0 && quiz_cat===1" :quiz_type="quiz_cat" :quiz_id="quiz_id" @quizFinished="quizFinished" />
      <QuizAreaWDYS v-if="vue>=0 && quiz_cat===2" :quiz_type="quiz_cat" :quiz_id="quiz_id" @quizFinished="quizFinished" />
      <QuizAreaFTC v-if="vue>=0 && quiz_cat===3" :quiz_type="quiz_cat" :quiz_id="quiz_id" @quizFinished="quizFinished" />
      <ResultsArea v-if="vue===-1" :score="this.score" @back="goToGameMenu" />
    </div>


    <FooterComponent :isConnected="true" />
  </div>
</template>

<script>

import FooterComponent from "@/components/FooterComponent.vue";
import QuizAreaCTF from "@/components/QuizComponents/QuizAreaCTF.vue";
import QuizAreaWDYS from "@/components/QuizComponents/QuizAreaWDYS.vue";
import QuizAreaFTC from "@/components/QuizComponents/QuizAreaFTC.vue";
import ResultsArea from "@/components/QuizComponents/ResultsArea.vue";
import axios from 'axios';

export default {
  name: "QuizView",
  data(){
    return{
      LogoSmall: require("@/assets/logo_terraquiz.svg"),
      vue:0,
      quiz_cat:1,
      quiz_id:1,
      score:[],
      quiz_name: "",
      quiz_image: ""
    }
  },
  components: {
    FooterComponent,
    QuizAreaCTF,
    QuizAreaWDYS,
    QuizAreaFTC,
    ResultsArea
  },
  methods: {
    goToGameMenu() {
      this.$router.push(`/menu-game?cat=${this.quiz_cat}`);
    },
    percentage(score){
      /* count the number of good answers (==1) and divide by the number of questions to get the percentage */
      let good_answers = 0;
      for (let i=0; i<score.length; i++){
        if (score[i]===1){
          good_answers++;
        }
      }
      return Math.round(good_answers/score.length*100);
    },
    updateProgress(user_id, quiz_id, progress_value){
      axios.post(`${process.env.VUE_APP_SERVER_API_URL}/quiz/progress/${quiz_id}/${user_id}`, {
        progress_value: progress_value
      })
    },
    quizFinished(score){
      this.vue=-1;
      this.score=score;
      this.session = JSON.parse(localStorage.getItem("session"));
      let user_id = this.session.user_id;
      let quiz_id = this.quiz_id;
      // if progress is better than current progress, update it
      axios.get(`${process.env.VUE_APP_SERVER_API_URL}/quiz/progress/${quiz_id}/${user_id}`).then((response) => {
        if (response.data.progress_value < this.percentage(this.score)){
          this.updateProgress(user_id, quiz_id, this.percentage(this.score));
        }
      });

    }
  },
  created() {
    if (!localStorage.getItem("session")) {
      this.$router.push("/");
    } else {
      this.quiz_cat = parseInt(this.$route.query.cat);
      this.quiz_id = parseInt(this.$route.query.quiz);

      axios.get(`${process.env.VUE_APP_SERVER_API_URL}/quiz/${this.quiz_id}`).then((response) => {
        this.quiz_name = response.data.quiz_name;
        this.quiz_image = '/assets/quiz_images/' + response.data.quiz_image + '.png';
      });
    }
  }
}

</script>

<style scoped>

#Page{
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: #48466D;
  color:white;
  font-family: "Concert One", cursive;
}

.logo{
  height: 100px;
  margin: 20px auto;
  cursor: pointer;
}

.title{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
.arrow{
  height: 30px;
}
.quiz_img{
  height: 50px;
}

.QuizArea{
  height: 50%;
  width: 70vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  background-color: #5E5C89;
  border-radius: 20px;

  margin: 20px auto;
  padding: 20px 50px;
}

@keyframes move{
  0%{
    transform: translateX(0px);
  }
  100%{
    transform: translateX(-5px);
  }
}

.arrow:hover{
  /* move from right to left */
  cursor:pointer;
  animation: move 0.5s ease-in-out infinite alternate;
}
@media (max-width: 768px) {
  .QuizArea {
    width: 80vw;
    padding: 20px 20px;
    margin: 0;
    justify-content: flex-start;
    gap:10px;
  }
}
</style>