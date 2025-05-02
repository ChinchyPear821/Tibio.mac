//welcomeUser
let welcomeUser = document.querySelector(".welcomeUser")
//datos
let userName = document.querySelector(".userName")
let userEmail = document.querySelector(".userEmail")
//let userDigits = document.querySelector(".userDigitsS")
let userBalance = document.querySelector(".userBalance")

//FETCH'S A LA API
async function fetchUserInfo(){
    try{
        const res = await fetch("http://localhost:1234/user/protected", {
            credentials: "include"
        })

        if(!res.ok) throw new Error("No pudo acceder a la informacion del usuario")

        return await res.json()
    }catch(e){
        console.log("Error al fetch de la informacion del usurio: ", e)
    }
}

//Renders de los Fetch
function renderUserInfo(){
    fetchUserInfo().then(user => {
        console.log(user)
        userName.textContent = `${user.username}`
        userEmail.textContent = `${user.email}`
        userBalance.textContent = `$${user.balance}`
    }).catch(e => console.error(e))
}

renderUserInfo()