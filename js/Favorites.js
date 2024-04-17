import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  delete(user) {
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
  
  async add(username) {
    try {
      if(username.trim() === '') {
        return
      }     
      
      const userExists = this.entries.find(entry => entry.login === username.trim().toLowerCase())
      
      if(userExists){
        throw new Error('Usuário já existe')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('Usuário não existe')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch (error) {
      alert(error.message)
    }
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    
    this.tbody = this.root.querySelector('table tbody')
    this.update()
    this.onAdd()
    
  }

  onAdd() {
    const addButton = this.root.querySelector('#addButton')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('#inputAdd')
      this.add(value)
      document.querySelector('#inputAdd').value = ""
    }
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <tr>
        <td class="user">
          <img src="" >
          <a href="" target="_blank">
            <p>Mayk Brito</p>
            <span>maykbrito</span>
          </a>
        </td>
        <td class="repositories">
          76
        </td>
        <td class="followers">
          9589
        </td>
        <td>
          <button class="remove">Remover</button>
        </td>
    
      </tr>
    `

    return tr
  }

  update() {
    this.removeAllTr()
    
    this.entries.length === 0 ? (
      this.emptyFavorites = this.createEmptyFavoritesRow(),
      this.tbody.append(this.emptyFavorites)
    )
    : 

    this.entries.forEach((user) => {
      const row = this.createRow()

      row.querySelector('.user img').src = `http://github.com/${user.login}.png`
      row.querySelector('.user a').href = `http://github.com/${user.login}.png`
      row.querySelector('.user a p').textContent = `${user.name}`
      row.querySelector('.user a span').textContent = `${user.login}`
      row.querySelector('.repositories').textContent = `${user.public_repos}`
      row.querySelector('.followers').textContent = `${user.followers}`

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja remover essa linha?')
        if(isOk) {
          this.delete(user)
        }
      }
      this.tbody.append(row)
    })
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => tr.remove())
  }

  createEmptyFavoritesRow() {
    const emptyRow = document.createElement('tr')

    emptyRow.innerHTML = `
      <tr>
        <td colspan="4">
          <div id="emptyFavorites">
            <img src="./assets/Estrela.svg" alt="">
            <h2>Nenhum favorito</h2>
          </div>
        </td>
      </tr>
    `
    
    return emptyRow
  }
}

