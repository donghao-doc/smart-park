import './home.scss'

/**
 * 运营总览页面入口，当前仅展示页面标题区
 */
function HomePage() {
  return (
    <section className="dashboard-page" aria-labelledby="dashboard-title">
      <header className="dashboard-heading">
        <div>
          <h1 id="dashboard-title">运营总览</h1>
          <p>实时掌握园区运营情况，助力科学决策</p>
        </div>
        <time dateTime="2024-04-22T10:24:00+08:00">2024年4月22日　星期一　10:24</time>
      </header>
    </section>
  )
}

export default HomePage
