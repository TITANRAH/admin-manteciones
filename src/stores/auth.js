import { defineStore } from "pinia";
import { useFirebaseAuth } from "vuefire";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { ref, computed, onMounted } from "vue";
import { useRouter} from 'vue-router'

export const useAuthStore = defineStore("auth", () => {

const auth = useFirebaseAuth();

  const errorMsg = ref("");
  const authUser = ref(null);
  const router = useRouter()

  console.log("authUser.value desde store", authUser.value);

  const errorCodes = {
    "auth/user-not-found": "Usuario no encontrado",
    "auth/wrong-password": "El password es incorrecto",
  };

  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("user AUTENTICADO desde onmounted store onAuthStateChanged,", user);
      authUser.value= user
    }
    });
  });

  const login = ({ email, password }) => {

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {    
        const user = userCredential.user;  
        authUser.value = user;
        router.push({name: 'dashboard'})    
      })
      .catch((e) => {   
        errorMsg.value = errorCodes[e.code];
      });
  };

  const logout = () => {
    signOut(auth).then(()=>{
        authUser.value = null
        router.push({name: 'login'})
        console.log('hizo logout')
    }).catch(e =>{ 
        console.log(e)
    })
  }
 
  const hasError = computed(() => {
    return errorMsg.value;
  });

  const isAuth = computed(()=>{
    return authUser.value
  })

  return {
    login,
    logout,
    hasError,
    errorMsg,
    authUser,
    isAuth
  };
});
