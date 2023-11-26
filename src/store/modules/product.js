 import Vue from "vue"
 import { router } from "../../router"
const state = {
    products : []
}

const getters = {
    getProducts(state){
        return state.products
    },
    getProduct(state){
           return key => state.products.filter(element => {
            return element.key == key
        })
    }
}

const mutations = {
    updateProductList(state, product){
        state.products.push(product)
    }
}

const actions = {
    initApp({ commit }) {
        // Vue resource işlemleri...
        Vue.http.get("https://urun-islemleri-prod-ed945-default-rtdb.firebaseio.com/product.json")
        .then(response =>{
            let data = response.body
            for(let key in data){
                data[key].key = key
                commit("updateProductList", data[key])
            }
        })
    },
    saveProduct({ dispatch, commit, state}, product){
        Vue.http.post("https://urun-islemleri-prod-ed945-default-rtdb.firebaseio.com/product.json", product)
        .then ( (response) => {
               // ürün listesinin güncellenmesi
            product.key = response.body.name
            commit("updateProductList", product)
                // alış, satış, bakiye bilgielerinin güncellenmesi
            let tradeResult = {
                purchase : product.price,
                sale : 0,
                count : product.count
            }
            dispatch("setTradeResult", tradeResult)
            router.replace("/")
        })
    },
    sellProduct( {state, commit, dispatch}, payload){
        // Vue resource işlemleri...

        // pass by reference
        // pass by value...

         let product = state.products.filter(element => {
            return element.key == payload.key
         })
            if(product) {

                let totalCount = product[0].count - payload.count
                Vue.http.patch("https://urun-islemleri-prod-ed945-default-rtdb.firebaseio.com/product/" + payload.key + ".json", { count : totalCount })
                .then(response =>{
                    product[0].count = totalCount
                    let tradeResult = {
                        purchase : 0,
                        sale : product[0].price,
                        count : payload.count
                    }
                    dispatch("setTradeResult", tradeResult)
                    router.replace("/")
                })
            }

        
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}