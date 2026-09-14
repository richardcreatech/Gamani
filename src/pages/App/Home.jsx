import { Outlet } from "react-router-dom"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

function Home() {
  return (
    <main id="my_main_app">
      <Header />
      <Outlet />
      <Footer></Footer>
    </main>
  )
}

export default Home
