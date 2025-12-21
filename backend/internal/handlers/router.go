package handlers

import (
	"net/http"

	"github.com/gorilla/mux"
)

func InitRouter() *mux.Router {
    router := mux.NewRouter() // create a new router
    // 这里只是登记，不是实际执行，相当于告诉路由器如何处理请求，相当于在router内部创建了一个映射表
    router.Handle("/login", http.HandlerFunc(loginHandler)).Methods("POST") // register loginHandler for POST /login
    router.Handle("/register", http.HandlerFunc(registerHandler)).Methods("POST") // register registerHandler for POST /register
    return router // rounter is a pointer, so no need to take address
    // 真正在执行时
    // router会自动创建w和r
    // w := 创建一个响应写入器
    // r := 从 HTTP 请求创建 Request 对象
    // 然后去调用对应的handler函数，并且传入w和r
    // 函数执行完后 router 会把
}