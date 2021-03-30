import { library, dom } from '@fortawesome/fontawesome-svg-core'

import { faSort, faSortUp, faSortDown, faSquare } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

library.add(faSort, faSortUp, faSortDown, faSquare, faGithub)

dom.i2svg()
export const refreshIcons = dom.i2svg
