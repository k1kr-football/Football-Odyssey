export interface Squad {
  club: string;
  manager: string;
  GK: string[];
  DF: string[];
  MF: string[];
  FW: string[];
}

export const SQUADS: Record<string, Squad> = {
  "Arsenal": {
    "club": "Arsenal",
    "manager": "Mikel Arteta",
    "GK": [
      "David Raya",
      "Kepa Arrizabalaga",
      "Karl Hein"
    ],
    "DF": [
      "William Saliba",
      "Ben White",
      "Gabriel Magalhães",
      "Cristhian Mosquera",
      "Jurrien Timber",
      "Jakub Kiwior",
      "Riccardo Calafiori",
      "Oleksandr Zinchenko"
    ],
    "MF": [
      "Martin Ødegaard",
      "Declan Rice",
      "Martin Zubimendi",
      "Mikel Merino",
      "Christian Nørgaard",
      "Ethan Nwaneri",
      "Myles Lewis-Skelly",
      "Fabio Vieira"
    ],
    "FW": [
      "Bukayo Saka",
      "Gabriel Jesus",
      "Viktor Gyökeres",
      "Gabriel Martinelli",
      "Leandro Trossard",
      "Noni Madueke",
      "Kai Havertz"
    ]
  },
  "Aston Villa": {
    "club": "Aston Villa",
    "manager": "Unai Emery",
    "GK": [
      "Emiliano Martínez",
      "Marco Bizot"
    ],
    "DF": [
      "Ezri Konsa",
      "Pau Torres",
      "Matty Cash",
      "Lucas Digne",
      "Andrés García",
      "Tyrone Mings"
    ],
    "MF": [
      "Youri Tielemans",
      "Boubacar Kamara",
      "John McGinn",
      "Amadou Onana",
      "Morgan Rogers",
      "Ross Barkley"
    ],
    "FW": [
      "Ollie Watkins",
      "Jhon Durán",
      "Jaden Philogene",
      "Leon Bailey",
      "Donyell Malen"
    ]
  },
  "Manchester City": {
    "club": "Manchester City",
    "manager": "Pep Guardiola",
    "GK": [
      "James Trafford",
      "Gianluigi Donnarumma",
      "Marcus Bettinelli"
    ],
    "DF": [
      "Rúben Dias",
      "Joško Gvardiol",
      "Abdukodir Khusanov",
      "Nathan Aké",
      "Rico Lewis",
      "Vitor Reis"
    ],
    "MF": [
      "Rodri",
      "Tijjani Reijnders",
      "Mateo Kovačić",
      "Nico O'Reilly",
      "Bernardo Silva",
      "Matheus Nunes"
    ],
    "FW": [
      "Erling Haaland",
      "Phil Foden",
      "Jérémy Doku",
      "Savinho",
      "Omar Marmoush",
      "Oscar Bobb"
    ]
  },
  "Manchester United": {
    "club": "Manchester United",
    "manager": "Ruben Amorim",
    "GK": [
      "André Onana",
      "Altay Bayındır"
    ],
    "DF": [
      "Lisandro Martínez",
      "Matthijs de Ligt",
      "Leny Yoro",
      "Noussair Mazraoui",
      "Diogo Dalot",
      "Luke Shaw",
      "Patrick Dorgu"
    ],
    "MF": [
      "Casemiro",
      "Manuel Ugarte",
      "Kobbie Mainoo",
      "Bruno Fernandes",
      "Mason Mount",
      "Toby Collyer"
    ],
    "FW": [
      "Bryan Mbeumo",
      "Matheus Cunha",
      "Benjamin Šeško",
      "Amad Diallo",
      "Alejandro Garnacho"
    ]
  },
  "Liverpool": {
    "club": "Liverpool",
    "manager": "Arne Slot",
    "GK": [
      "Alisson",
      "Giorgi Mamardashvili"
    ],
    "DF": [
      "Virgil van Dijk",
      "Ibrahima Konaté",
      "Jeremie Frimpong",
      "Milos Kerkez",
      "Andrew Robertson",
      "Joe Gomez"
    ],
    "MF": [
      "Ryan Gravenberch",
      "Alexis Mac Allister",
      "Curtis Jones",
      "Wataru Endo",
      "Dominik Szoboszlai"
    ],
    "FW": [
      "Mohamed Salah",
      "Cody Gakpo",
      "Florian Wirtz",
      "Hugo Ekitiké",
      "Federico Chiesa",
      "Luis Díaz"
    ]
  },
  "Tottenham Hotspur": {
    "club": "Tottenham Hotspur",
    "manager": "Thomas Frank",
    "GK": [
      "Guglielmo Vicario",
      "Antonín Kinský"
    ],
    "DF": [
      "Cristian Romero",
      "Micky van de Ven",
      "Destiny Udogie",
      "Pedro Porro",
      "Kevin Danso",
      "Djed Spence"
    ],
    "MF": [
      "Rodrigo Bentancur",
      "Yves Bissouma",
      "Pape Matar Sarr",
      "James Maddison",
      "Lucas Bergvall"
    ],
    "FW": [
      "Dominic Solanke",
      "Richarlison",
      "Brennan Johnson",
      "Mathys Tel",
      "Wilson Odobert"
    ]
  },
  "Chelsea": {
    "club": "Chelsea",
    "manager": "Enzo Maresca",
    "GK": [
      "Robert Sánchez",
      "Filip Jörgensen"
    ],
    "DF": [
      "Levi Colwill",
      "Wesley Fofana",
      "Marc Cucurella",
      "Reece James",
      "Malo Gusto",
      "Trevoh Chalobah",
      "Benoît Badiashile"
    ],
    "MF": [
      "Moisés Caicedo",
      "Enzo Fernández",
      "Romeo Lavia",
      "Cole Palmer"
    ],
    "FW": [
      "Nicolas Jackson",
      "Liam Delap",
      "Pedro Neto",
      "João Pedro",
      "Christopher Nkunku",
      "Tyrique George"
    ]
  },
  "Newcastle United": {
    "club": "Newcastle United",
    "manager": "Eddie Howe",
    "GK": [
      "Nick Pope",
      "Martin Dúbravka"
    ],
    "DF": [
      "Sven Botman",
      "Fabian Schär",
      "Dan Burn",
      "Kieran Trippier",
      "Tino Livramento",
      "Lewis Hall"
    ],
    "MF": [
      "Bruno Guimarães",
      "Sandro Tonali",
      "Joelinton",
      "Joe Willock"
    ],
    "FW": [
      "Alexander Isak",
      "Anthony Gordon",
      "Harvey Barnes",
      "Jacob Murphy",
      "William Osula"
    ]
  },
  "Brighton & Hove Albion": {
    "club": "Brighton & Hove Albion",
    "manager": "Fabian Hürzeler",
    "GK": [
      "Bart Verbruggen",
      "Jason Steele"
    ],
    "DF": [
      "Lewis Dunk",
      "Jan Paul van Hecke",
      "Adam Webster",
      "Tariq Lamptey",
      "Pervis Estupiñán",
      "Joel Veltman"
    ],
    "MF": [
      "Carlos Baleba",
      "James Milner",
      "Mats Wieffer",
      "Yankuba Minteh",
      "Kaoru Mitoma"
    ],
    "FW": [
      "Danny Welbeck",
      "João Pedro Júnior",
      "Georginio Rutter",
      "Stefanos Tzimas"
    ]
  },
  "AFC Bournemouth": {
    "club": "AFC Bournemouth",
    "manager": "Andoni Iraola",
    "GK": [
      "Đorđe Petrović",
      "Mark Travers"
    ],
    "DF": [
      "Illia Zabarnyi",
      "Marcos Senesi",
      "Adam Smith",
      "Milos Kerkez (loan/sold context varies)",
      "Julián Araujo",
      "Dean Huijsen"
    ],
    "MF": [
      "Lewis Cook",
      "Ryan Christie",
      "Tyler Adams",
      "Alex Scott"
    ],
    "FW": [
      "Antoine Semenyo",
      "Evanilson",
      "Justin Kluivert",
      "Eli Junior Kroupi",
      "Enes Ünal"
    ]
  },
  "Brentford": {
    "club": "Brentford",
    "manager": "Keith Andrews",
    "GK": [
      "Mark Flekken",
      "Hákon Valdimarsson"
    ],
    "DF": [
      "Nathan Collins",
      "Ethan Pinnock",
      "Rico Henry",
      "Aaron Hickey",
      "Sepp van den Berg"
    ],
    "MF": [
      "Christian Nørgaard",
      "Mathias Jensen",
      "Mikkel Damsgaard",
      "Vitaly Janelt"
    ],
    "FW": [
      "Yoane Wissa",
      "Igor Thiago",
      "Kevin Schade",
      "Fábio Carvalho"
    ]
  },
  "Crystal Palace": {
    "club": "Crystal Palace",
    "manager": "Oliver Glasner",
    "GK": [
      "Dean Henderson",
      "Walter Benítez"
    ],
    "DF": [
      "Marc Guéhi",
      "Maxence Lacroix",
      "Tyrick Mitchell",
      "Daniel Muñoz",
      "Chris Richards"
    ],
    "MF": [
      "Adam Wharton",
      "Will Hughes",
      "Jefferson Lerma",
      "Cheick Doucouré",
      "Eberechi Eze"
    ],
    "FW": [
      "Jean-Philippe Mateta",
      "Ismaïla Sarr",
      "Eddie Nketiah",
      "Yéremy Pino"
    ]
  },
  "Everton": {
    "club": "Everton",
    "manager": "David Moyes",
    "GK": [
      "Jordan Pickford",
      "Mark Travers"
    ],
    "DF": [
      "James Tarkowski",
      "Jarrad Branthwaite",
      "Vitaliy Mykolenko",
      "Jake O'Brien",
      "Nathan Patterson"
    ],
    "MF": [
      "Idrissa Gueye",
      "Abdoulaye Doucouré",
      "James Garner",
      "Iliman Ndiaye"
    ],
    "FW": [
      "Dominic Calvert-Lewin",
      "Beto",
      "Jack Grealish",
      "Tim Iroegbunam"
    ]
  },
  "Fulham": {
    "club": "Fulham",
    "manager": "Marco Silva",
    "GK": [
      "Bernd Leno",
      "Benjamin Lecomte"
    ],
    "DF": [
      "Calvin Bassey",
      "Joachim Andersen",
      "Antonee Robinson",
      "Timothy Castagne",
      "Issa Diop"
    ],
    "MF": [
      "Sander Berge",
      "Emile Smith Rowe",
      "Harrison Reed",
      "Andreas Pereira"
    ],
    "FW": [
      "Rodrigo Muniz",
      "Raúl Jiménez",
      "Alex Iwobi",
      "Adama Traoré"
    ]
  },
  "Nottingham Forest": {
    "club": "Nottingham Forest",
    "manager": "Ange Postecoglou",
    "GK": [
      "Matz Sels",
      "Carlos Miguel"
    ],
    "DF": [
      "Murillo",
      "Nikola Milenković",
      "Neco Williams",
      "Ola Aina",
      "Morato"
    ],
    "MF": [
      "Elliot Anderson",
      "Ibrahim Sangaré",
      "Douglas Luiz",
      "Morgan Gibbs-White"
    ],
    "FW": [
      "Chris Wood",
      "Callum Hudson-Odoi",
      "Taiwo Awoniyi",
      "Anthony Elanga"
    ]
  },
  "Sunderland": {
    "club": "Sunderland",
    "manager": "Régis Le Bris",
    "GK": [
      "Anthony Patterson",
      "Simon Moore"
    ],
    "DF": [
      "Dan Ballard",
      "Daniel Munoz (loan context)",
      "Trai Hume",
      "Reinildo",
      "Léo Hjelde"
    ],
    "MF": [
      "Chris Rigg",
      "Dan Neil",
      "Granit Xhaka",
      "Alan Browne"
    ],
    "FW": [
      "Wilson Isidor",
      "Eliezer Mayenda",
      "Romaine Mundle",
      "Brian Brobbey"
    ]
  },
  "Leeds United": {
    "club": "Leeds United",
    "manager": "Daniel Farke",
    "GK": [
      "Lucas Perri",
      "Karl Darlow"
    ],
    "DF": [
      "Pascal Struijk",
      "Joe Rodon",
      "Jayden Bogle",
      "Ethan Ampadu",
      "Sam Byram"
    ],
    "MF": [
      "Ilia Gruev",
      "Ao Tanaka",
      "Brenden Aaronson",
      "Largie Ramazani"
    ],
    "FW": [
      "Joël Piroe",
      "Lukas Nmecha",
      "Mateo Joseph",
      "Dominic Calvert-Lewin (varies)"
    ]
  },
  "Coventry City": {
    "club": "Coventry City",
    "manager": "Frank Lampard",
    "GK": [
      "Ben Wilson",
      "Oliver Dovin"
    ],
    "DF": [
      "Bobby Thomas",
      "Liam Kitching",
      "Jay Dasilva",
      "Joel Latibeaudiere",
      "Brooke Norton-Cuffy"
    ],
    "MF": [
      "Ben Sheaf",
      "Josh Eccles",
      "Jack Rudoni",
      "Victor Torp"
    ],
    "FW": [
      "Ellis Simms",
      "Haji Wright",
      "Tatsuhiro Sakamoto",
      "Brandon Thomas-Asante"
    ]
  },
  "Ipswich Town": {
    "club": "Ipswich Town",
    "manager": "Kieran McKenna",
    "GK": [
      "Aro Muric",
      "Christian Walton"
    ],
    "DF": [
      "Cameron Burgess",
      "Jacob Greaves",
      "Axel Tuanzebe",
      "Leif Davis",
      "Dara O'Shea"
    ],
    "MF": [
      "Jens Cajuste",
      "Massimo Luongo",
      "Sammie Szmodics",
      "Jack Taylor"
    ],
    "FW": [
      "Liam Delap (varies by window)",
      "Omari Hutchinson",
      "George Hirst",
      "Nathan Broadhead"
    ]
  },
  "Hull City": {
    "club": "Hull City",
    "manager": "Sergej Jakirović",
    "GK": [
      "Ivor Pandur",
      "Etienne Green"
    ],
    "DF": [
      "Jacob Greaves (varies)",
      "Charlie Hughes",
      "Lewie Coyle",
      "Alfie Jones",
      "Liam Millar"
    ],
    "MF": [
      "Joe Gelhardt",
      "Mohamed Belloumi",
      "Greg Docherty",
      "Jaheim Headley"
    ],
    "FW": [
      "Liam Delap (varies)",
      "Abu Kamara",
      "Fábio Carvalho (varies)",
      "Ryan Longman"
    ]
  }
};
