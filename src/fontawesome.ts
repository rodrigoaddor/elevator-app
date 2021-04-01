import { library, dom } from '@fortawesome/fontawesome-svg-core'

import { faSort, faSortUp, faSortDown, faSquare, faVolumeUp, faVolumeMute, faUser, faUserClock } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

library.add(faSort, faSortUp, faSortDown, faSquare, faGithub, faVolumeUp, faVolumeMute, faUser, faUserClock)

dom.watch()