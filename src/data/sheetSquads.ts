export interface SheetPlayer {
  name: string;
  ovr: number;
}

export interface ClubSquad {
  manager: string;
  players: SheetPlayer[];
}

export const SHEET_SQUADS: Record<string, ClubSquad> = {
  "Arsenal": {
    manager: "Mikel Arteta",
    players: [
      { name: "David Raya", ovr: 93 },
      { name: "Myles Lewis-Skelly", ovr: 91 },
      { name: "Ben White", ovr: 89 },
      { name: "William Saliba", ovr: 89 },
      { name: "Riccardo Calafiori", ovr: 88 },
      { name: "Thomas Partey", ovr: 88 },
      { name: "Martin Ødegaard", ovr: 87 },
      { name: "Declan Rice", ovr: 88 },
      { name: "Bukayo Saka", ovr: 88 },
      { name: "Leandro Trossard", ovr: 85 },
      { name: "Kai Havertz", ovr: 88 },
      { name: "Gabriel Magalhães", ovr: 83 },
      { name: "Jurriën Timber", ovr: 84 },
      { name: "Gabriel Martinelli", ovr: 82 },
    ]
  },
  "Aston Villa": {
    manager: "Unai Emery",
    players: [
      { name: "Emiliano Martínez", ovr: 88 },
      { name: "Ezri Konsa", ovr: 87 },
      { name: "Pau Torres", ovr: 87 },
      { name: "Lucas Digne", ovr: 85 },
      { name: "Matty Cash", ovr: 83 },
      { name: "John McGinn", ovr: 83 },
      { name: "Youri Tielemans", ovr: 81 },
      { name: "Boubacar Kamara", ovr: 81 },
      { name: "Morgan Rogers", ovr: 84 },
      { name: "Ollie Watkins", ovr: 80 },
      { name: "Leon Bailey", ovr: 81 },
      { name: "Tyrone Mings", ovr: 81 },
      { name: "Amadou Onana", ovr: 78 },
      { name: "Donyell Malen", ovr: 78 },
    ]
  },
  "Bournemouth": {
    manager: "Andoni Iraola",
    players: [
      { name: "Neto", ovr: 83 },
      { name: "Adam Smith", ovr: 82 },
      { name: "Marcos Senesi", ovr: 85 },
      { name: "Ilya Zabarnyi", ovr: 82 },
      { name: "Milos Kerkez", ovr: 81 },
      { name: "Lewis Cook", ovr: 82 },
      { name: "Ryan Christie", ovr: 81 },
      { name: "Tyler Adams", ovr: 79 },
      { name: "David Brooks", ovr: 77 },
      { name: "Evanilson", ovr: 76 },
      { name: "Justin Kluivert", ovr: 77 },
      { name: "Mark Travers", ovr: 76 },
      { name: "James Hill", ovr: 74 },
      { name: "Marcus Tavernier", ovr: 72 },
    ]
  },
  "Brentford": {
    manager: "Keith Andrews",
    players: [
      { name: "Mark Flekken", ovr: 86 },
      { name: "Sepp van den Berg", ovr: 83 },
      { name: "Ethan Pinnock", ovr: 83 },
      { name: "Kristoffer Ajer", ovr: 83 },
      { name: "Rico Henry", ovr: 81 },
      { name: "Vitaly Janelt", ovr: 81 },
      { name: "Mathias Jensen", ovr: 78 },
      { name: "Mikkel Damsgaard", ovr: 81 },
      { name: "Bryan Mbeumo", ovr: 78 },
      { name: "Yoane Wissa", ovr: 77 },
      { name: "Kevin Schade", ovr: 76 },
      { name: "Nathan Collins", ovr: 74 },
      { name: "Hakon Valdimarsson", ovr: 76 },
      { name: "Fabio Carvalho", ovr: 73 },
    ]
  },
  "Brighton & Hove Albion": {
    manager: "Fabian Hürzeler",
    players: [
      { name: "Bart Verbruggen", ovr: 84 },
      { name: "Joel Veltman", ovr: 86 },
      { name: "Lewis Dunk", ovr: 82 },
      { name: "Jan Paul van Hecke", ovr: 82 },
      { name: "Pervis Estupiñan", ovr: 82 },
      { name: "Adam Lallana", ovr: 79 },
      { name: "Jack Hinshelwood", ovr: 78 },
      { name: "Carlos Baleba", ovr: 80 },
      { name: "Kaoru Mitoma", ovr: 79 },
      { name: "Evan Ferguson", ovr: 78 },
      { name: "Danny Welbeck", ovr: 76 },
      { name: "Simon Adingra", ovr: 74 },
      { name: "Mats Wieffer", ovr: 74 },
      { name: "Jason Steele", ovr: 75 },
    ]
  },
  "Burnley": {
    manager: "Vincent Kompany",
    players: [
      { name: "James Trafford", ovr: 85 },
      { name: "Connor Roberts", ovr: 82 },
      { name: "Maxime Esteve", ovr: 81 },
      { name: "CJ Egan-Riley", ovr: 83 },
      { name: "Vitinho", ovr: 82 },
      { name: "Josh Cullen", ovr: 82 },
      { name: "Hannes Delcroix", ovr: 78 },
      { name: "Jaidon Anthony", ovr: 79 },
      { name: "Luca Koleosho", ovr: 79 },
      { name: "Zian Flemming", ovr: 76 },
      { name: "Jay Rodriguez", ovr: 76 },
      { name: "Anass Zaroury", ovr: 77 },
      { name: "Andreas Hountondji", ovr: 73 },
      { name: "Aaron Ramsey", ovr: 72 },
    ]
  },
  "Chelsea": {
    manager: "Enzo Maresca",
    players: [
      { name: "Filip Jörgensen", ovr: 85 },
      { name: "Reece James", ovr: 87 },
      { name: "Wesley Fofana", ovr: 84 },
      { name: "Levi Colwill", ovr: 85 },
      { name: "Ben Chilwell", ovr: 82 },
      { name: "Moises Caicedo", ovr: 85 },
      { name: "Enzo Fernández", ovr: 84 },
      { name: "Cole Palmer", ovr: 82 },
      { name: "Pedro Neto", ovr: 83 },
      { name: "Nicolas Jackson", ovr: 82 },
      { name: "Noni Madueke", ovr: 80 },
      { name: "Tosin Adarabioyo", ovr: 79 },
      { name: "Marc Cucurella", ovr: 78 },
      { name: "Christopher Nkunku", ovr: 80 },
    ]
  },
  "Crystal Palace": {
    manager: "Oliver Glasner",
    players: [
      { name: "Dean Henderson", ovr: 86 },
      { name: "Chris Richards", ovr: 82 },
      { name: "Marc Guéhi", ovr: 81 },
      { name: "Tyrick Mitchell", ovr: 80 },
      { name: "Daniel Muñoz", ovr: 80 },
      { name: "Cheick Doucouré", ovr: 81 },
      { name: "Adam Wharton", ovr: 80 },
      { name: "Jeffery Schlupp", ovr: 79 },
      { name: "Eberechi Eze", ovr: 77 },
      { name: "Jean-Philippe Mateta", ovr: 76 },
      { name: "Michael Olise", ovr: 77 },
      { name: "Joachim Andersen", ovr: 77 },
      { name: "Nathan Ferguson", ovr: 76 },
      { name: "Ismaila Sarr", ovr: 75 },
    ]
  },
  "Everton": {
    manager: "David Moyes",
    players: [
      { name: "Jordan Pickford", ovr: 85 },
      { name: "Seamus Coleman", ovr: 84 },
      { name: "James Tarkowski", ovr: 84 },
      { name: "Jarrad Branthwaite", ovr: 82 },
      { name: "Vitalii Mykolenko", ovr: 80 },
      { name: "Idrissa Gueye", ovr: 82 },
      { name: "Abdoulaye Doucouré", ovr: 81 },
      { name: "Dwight McNeil", ovr: 79 },
      { name: "Dominic Calvert-Lewin", ovr: 78 },
      { name: "Jack Harrison", ovr: 79 },
      { name: "Ashley Young", ovr: 75 },
      { name: "Beto", ovr: 74 },
      { name: "James Garner", ovr: 75 },
    ]
  },
  "Fulham": {
    manager: "Marco Silva",
    players: [
      { name: "Bernd Leno", ovr: 83 },
      { name: "Kenny Tete", ovr: 85 },
      { name: "Calvin Bassey", ovr: 83 },
      { name: "Antonee Robinson", ovr: 82 },
      { name: "João Palhinha", ovr: 81 },
      { name: "Tom Cairney", ovr: 80 },
      { name: "Andreas Pereira", ovr: 79 },
      { name: "Willian", ovr: 79 },
      { name: "Rodrigo Muniz", ovr: 79 },
      { name: "Alex Iwobi", ovr: 75 },
      { name: "Timothy Castagne", ovr: 75 },
      { name: "Harry Wilson", ovr: 74 },
      { name: "Adama Traoré", ovr: 73 },
    ]
  },
  "Leeds United": {
    manager: "Daniel Farke",
    players: [
      { name: "Illan Meslier", ovr: 84 },
      { name: "Luke Ayling", ovr: 83 },
      { name: "Pascal Struijk", ovr: 84 },
      { name: "Joe Rodon", ovr: 80 },
      { name: "Sam Byram", ovr: 81 },
      { name: "Ethan Ampadu", ovr: 80 },
      { name: "Glen Kamara", ovr: 81 },
      { name: "Wilfried Gnonto", ovr: 78 },
      { name: "Crysencio Summerville", ovr: 78 },
      { name: "Patrick Bamford", ovr: 76 },
      { name: "Joel Piroe", ovr: 77 },
      { name: "Max Wöber", ovr: 75 },
      { name: "Brenden Aaronson", ovr: 75 },
      { name: "Ilia Gruev", ovr: 73 },
    ]
  },
  "Liverpool": {
    manager: "Arne Slot",
    players: [
      { name: "Alisson Becker", ovr: 88 },
      { name: "Trent Alexander-Arnold", ovr: 91 },
      { name: "Ibrahima Konaté", ovr: 87 },
      { name: "Virgil van Dijk", ovr: 88 },
      { name: "Andrew Robertson", ovr: 88 },
      { name: "Alexis Mac Allister", ovr: 88 },
      { name: "Ryan Gravenberch", ovr: 85 },
      { name: "Dominik Szoboszlai", ovr: 85 },
      { name: "Mohamed Salah", ovr: 85 },
      { name: "Darwin Núñez", ovr: 86 },
      { name: "Luis Díaz", ovr: 85 },
      { name: "Diogo Jota", ovr: 82 },
      { name: "Harvey Elliott", ovr: 83 },
      { name: "Cody Gakpo", ovr: 82 },
    ]
  },
  "Manchester City": {
    manager: "Pep Guardiola",
    players: [
      { name: "Ederson", ovr: 93 },
      { name: "Kyle Walker", ovr: 90 },
      { name: "Rúben Dias", ovr: 90 },
      { name: "Manuel Akanji", ovr: 89 },
      { name: "Josko Gvardiol", ovr: 89 },
      { name: "Rodri", ovr: 88 },
      { name: "Kevin De Bruyne", ovr: 89 },
      { name: "Phil Foden", ovr: 88 },
      { name: "Bernardo Silva", ovr: 89 },
      { name: "Erling Haaland", ovr: 88 },
      { name: "Jeremy Doku", ovr: 86 },
      { name: "Jack Grealish", ovr: 84 },
      { name: "John Stones", ovr: 85 },
      { name: "Stefan Ortega", ovr: 82 },
    ]
  },
  "Manchester United": {
    manager: "Ruben Amorim",
    players: [
      { name: "André Onana", ovr: 87 },
      { name: "Victor Lindelöf", ovr: 86 },
      { name: "Lisandro Martínez", ovr: 84 },
      { name: "Harry Maguire", ovr: 86 },
      { name: "Diogo Dalot", ovr: 86 },
      { name: "Casemiro", ovr: 82 },
      { name: "Bruno Fernandes", ovr: 82 },
      { name: "Mason Mount", ovr: 81 },
      { name: "Antony", ovr: 82 },
      { name: "Rasmus Højlund", ovr: 81 },
      { name: "Marcus Rashford", ovr: 79 },
      { name: "Luke Shaw", ovr: 82 },
      { name: "Christian Eriksen", ovr: 81 },
      { name: "Kobbie Mainoo", ovr: 81 },
    ]
  },
  "Newcastle United": {
    manager: "Eddie Howe",
    players: [
      { name: "Nick Pope", ovr: 87 },
      { name: "Kieran Trippier", ovr: 86 },
      { name: "Fabian Schär", ovr: 84 },
      { name: "Sven Botman", ovr: 83 },
      { name: "Dan Burn", ovr: 83 },
      { name: "Sandro Tonali", ovr: 83 },
      { name: "Joelinton", ovr: 82 },
      { name: "Bruno Guimarães", ovr: 82 },
      { name: "Harvey Barnes", ovr: 80 },
      { name: "Alexander Isak", ovr: 80 },
      { name: "Anthony Gordon", ovr: 81 },
      { name: "Joe Willock", ovr: 81 },
      { name: "Callum Wilson", ovr: 78 },
    ]
  },
  "Nottingham Forest": {
    manager: "Sean Dyche",
    players: [
      { name: "Matz Sels", ovr: 84 },
      { name: "Ola Aina", ovr: 85 },
      { name: "Willy Boly", ovr: 85 },
      { name: "Murillo", ovr: 81 },
      { name: "Harry Toffolo", ovr: 79 },
      { name: "Ryan Yates", ovr: 80 },
      { name: "Ibrahim Sangaré", ovr: 80 },
      { name: "Morgan Gibbs-White", ovr: 80 },
      { name: "Callum Hudson-Odoi", ovr: 79 },
      { name: "Taiwo Awoniyi", ovr: 76 },
      { name: "Anthony Elanga", ovr: 74 },
      { name: "Nuno Tavares", ovr: 76 },
      { name: "Elliot Anderson", ovr: 74 },
      { name: "Nikola Milenkovic", ovr: 75 },
    ]
  },
  "Sunderland": {
    manager: "Régis Le Bris",
    players: [
      { name: "Anthony Patterson", ovr: 83 },
      { name: "Luke O'Nien", ovr: 85 },
      { name: "Danny Batth", ovr: 82 },
      { name: "Chris Mepham", ovr: 81 },
      { name: "Dennis Cirkin", ovr: 82 },
      { name: "Dan Neil", ovr: 80 },
      { name: "Corry Evans", ovr: 81 },
      { name: "Pierre Ekwah", ovr: 80 },
      { name: "Diallo Nampalys", ovr: 77 },
      { name: "Eliezer Mayenda", ovr: 76 },
      { name: "Jack Clarke", ovr: 76 },
      { name: "Abdoullah Ba", ovr: 74 },
      { name: "Wilson Isidor", ovr: 75 },
      { name: "Romaine Mundle", ovr: 75 },
    ]
  },
  "Tottenham Hotspur": {
    manager: "Ange Postecoglou",
    players: [
      { name: "Guglielmo Vicario", ovr: 88 },
      { name: "Pedro Porro", ovr: 84 },
      { name: "Cristian Romero", ovr: 84 },
      { name: "Micky van de Ven", ovr: 83 },
      { name: "Destiny Udogie", ovr: 84 },
      { name: "Yves Bissouma", ovr: 82 },
      { name: "Pape Matar Sarr", ovr: 84 },
      { name: "James Maddison", ovr: 84 },
      { name: "Heung-min Son", ovr: 83 },
      { name: "Richarlison", ovr: 80 },
      { name: "Brennan Johnson", ovr: 80 },
      { name: "Rodrigo Bentancur", ovr: 78 },
      { name: "Dejan Kulusevski", ovr: 80 },
      { name: "Manor Solomon", ovr: 77 },
    ]
  },
  "West Ham United": {
    manager: "Julen Lopetegui",
    players: [
      { name: "Łukasz Fabiański", ovr: 86 },
      { name: "Ben Johnson", ovr: 84 },
      { name: "Kurt Zouma", ovr: 84 },
      { name: "Nayef Aguerd", ovr: 84 },
      { name: "Aaron Cresswell", ovr: 81 },
      { name: "James Ward-Prowse", ovr: 79 },
      { name: "Tomáš Souček", ovr: 78 },
      { name: "Lucas Paquetá", ovr: 79 },
      { name: "Jarrod Bowen", ovr: 78 },
      { name: "Danny Ings", ovr: 78 },
      { name: "Mohammed Kudus", ovr: 76 },
      { name: "Edson Álvarez", ovr: 74 },
      { name: "Michail Antonio", ovr: 75 },
      { name: "George Earthy", ovr: 73 },
    ]
  },
  "Wolverhampton Wanderers": {
    manager: "Rob Edwards",
    players: [
      { name: "José Sá", ovr: 85 },
      { name: "Matt Doherty", ovr: 84 },
      { name: "Max Kilman", ovr: 85 },
      { name: "Craig Dawson", ovr: 82 },
      { name: "Hugo Bueno", ovr: 81 },
      { name: "Joao Gomes", ovr: 79 },
      { name: "Tommy Doyle", ovr: 81 },
      { name: "Matheus Cunha", ovr: 80 },
      { name: "Pedro Neto", ovr: 80 },
      { name: "Hee-chan Hwang", ovr: 75 },
      { name: "Pablo Sarabia", ovr: 75 },
      { name: "Toti Gomes", ovr: 75 },
      { name: "Rayan Aït-Nouri", ovr: 76 },
      { name: "Boubacar Traoré", ovr: 73 },
    ]
  },
  "Birmingham City": {
    manager: "Chris Davies",
    players: [
      { name: "John Ruddy", ovr: 83 },
      { name: "Lee Buchanan", ovr: 86 },
      { name: "Dion Sanderson", ovr: 84 },
      { name: "Marc Roberts", ovr: 80 },
      { name: "Krystian Bielik", ovr: 82 },
      { name: "Willum Willumsson", ovr: 79 },
      { name: "Alfie Chang", ovr: 81 },
      { name: "Juninho Bacuna", ovr: 78 },
      { name: "Koji Miyoshi", ovr: 79 },
      { name: "Scott Hogan", ovr: 75 },
      { name: "Lukas Jutkiewicz", ovr: 76 },
    ]
  },
  "Blackburn Rovers": {
    manager: "John Eustace",
    players: [
      { name: "Aynsley Pears", ovr: 84 },
      { name: "Daniel Ayala", ovr: 84 },
      { name: "Dominic Hyam", ovr: 83 },
      { name: "Ryan Giles", ovr: 83 },
      { name: "Lewis Travis", ovr: 81 },
      { name: "John Buckley", ovr: 79 },
      { name: "Sammie Szmodics", ovr: 80 },
      { name: "Ben Brereton Díaz", ovr: 77 },
      { name: "Tyrhys Dolan", ovr: 76 },
      { name: "Ryan Hedges", ovr: 78 },
      { name: "Dilan Markanday", ovr: 78 },
    ]
  },
  "Bristol City": {
    manager: "Liam Manning",
    players: [
      { name: "Max O'Leary", ovr: 85 },
      { name: "Cameron Pring", ovr: 84 },
      { name: "Rob Atkinson", ovr: 82 },
      { name: "Kal Naismith", ovr: 82 },
      { name: "Nahki Wells", ovr: 80 },
      { name: "Han-Noah Massengo", ovr: 82 },
      { name: "Alex Scott", ovr: 81 },
      { name: "Andreas Weimann", ovr: 77 },
      { name: "Sam Bell", ovr: 78 },
      { name: "Tommy Conway", ovr: 77 },
      { name: "Anis Mehmeti", ovr: 75 },
    ]
  },
  "Cardiff City": {
    manager: "Erol Bulut",
    players: [
      { name: "Ryan Allsop", ovr: 83 },
      { name: "Perry Ng", ovr: 84 },
      { name: "Cedric Kipré", ovr: 83 },
      { name: "Mark McGuinness", ovr: 83 },
      { name: "Josh Murphy", ovr: 83 },
      { name: "Mantan Sawyers", ovr: 80 },
      { name: "Ollie Tanner", ovr: 79 },
      { name: "Callum O'Dowda", ovr: 78 },
      { name: "Romaine Sawyers", ovr: 79 },
      { name: "Aaron Ramsey", ovr: 76 },
      { name: "Kion Etete", ovr: 74 },
    ]
  },
  "Coventry City": {
    manager: "Mark Robins",
    players: [
      { name: "Ben Wilson", ovr: 86 },
      { name: "Joel Latibeaudiere", ovr: 83 },
      { name: "Kyle McFadzean", ovr: 83 },
      { name: "Jake Bidwell", ovr: 81 },
      { name: "Liam Kelly", ovr: 81 },
      { name: "Ben Sheaf", ovr: 81 },
      { name: "Callum O'Hare", ovr: 81 },
      { name: "Gustavo Hamer", ovr: 79 },
      { name: "Kasey Palmer", ovr: 79 },
      { name: "Viktor Gyökheres", ovr: 79 },
      { name: "Haji Wright", ovr: 77 },
    ]
  },
  "Derby County": {
    manager: "Paul Warne",
    players: [
      { name: "Joe Wildsmith", ovr: 86 },
      { name: "Haydon Roberts", ovr: 84 },
      { name: "Curtis Davies", ovr: 84 },
      { name: "Eiran Cashin", ovr: 83 },
      { name: "Craig Forsyth", ovr: 82 },
      { name: "Conor Hourihane", ovr: 82 },
      { name: "Tom Barkhuizen", ovr: 78 },
      { name: "Jerry Yates", ovr: 79 },
      { name: "David McGoldrick", ovr: 77 },
      { name: "James Collins", ovr: 76 },
      { name: "Nathaniel Mendez-Laing", ovr: 76 },
    ]
  },
  "Hull City": {
    manager: "Liam Rosenior",
    players: [
      { name: "Matt Ingram", ovr: 85 },
      { name: "Lewie Coyle", ovr: 83 },
      { name: "Alfie Jones", ovr: 81 },
      { name: "Jacob Greaves", ovr: 82 },
      { name: "Callum Elder", ovr: 83 },
      { name: "Ryan Woods", ovr: 82 },
      { name: "Jean Michaël Seri", ovr: 81 },
      { name: "Ozan Tufan", ovr: 78 },
      { name: "Abdus Omur", ovr: 77 },
      { name: "Oscar Estupiñan", ovr: 75 },
      { name: "Liam Delap", ovr: 75 },
    ]
  },
  "Ipswich Town": {
    manager: "Kieran McKenna",
    players: [
      { name: "Christian Walton", ovr: 85 },
      { name: "Janoi Donacien", ovr: 83 },
      { name: "George Edmundson", ovr: 85 },
      { name: "Cameron Burgess", ovr: 83 },
      { name: "Leif Davis", ovr: 80 },
      { name: "Sam Morsy", ovr: 81 },
      { name: "Lee Evans", ovr: 78 },
      { name: "Marcus Harness", ovr: 78 },
      { name: "Wes Burns", ovr: 77 },
      { name: "Freddie Ladapo", ovr: 79 },
      { name: "Conor Chaplin", ovr: 77 },
    ]
  },
  "Leicester City": {
    manager: "Enzo Maresca",
    players: [
      { name: "Mads Hermansen", ovr: 86 },
      { name: "James Justin", ovr: 84 },
      { name: "Wout Faes", ovr: 81 },
      { name: "Jannik Vestergaard", ovr: 83 },
      { name: "Ricardo Pereira", ovr: 79 },
      { name: "Wilfred Ndidi", ovr: 81 },
      { name: "Kiernan Dewsbury-Hall", ovr: 79 },
      { name: "Boubakary Soumaré", ovr: 78 },
      { name: "Harvey Barnes", ovr: 79 },
      { name: "Jamie Vardy", ovr: 77 },
      { name: "Kelechi Iheanacho", ovr: 76 },
    ]
  },
  "Middlesbrough": {
    manager: "Michael Carrick",
    players: [
      { name: "Liam Roberts", ovr: 86 },
      { name: "Anfernee Dijksteel", ovr: 82 },
      { name: "Dael Fry", ovr: 84 },
      { name: "Rav van den Berg", ovr: 83 },
      { name: "Isaiah Jones", ovr: 81 },
      { name: "Riley McGree", ovr: 82 },
      { name: "Hayden Hackney", ovr: 80 },
      { name: "Matt Crooks", ovr: 77 },
      { name: "Marcus Forss", ovr: 76 },
      { name: "Chuba Akpom", ovr: 78 },
    ]
  },
  "Millwall": {
    manager: "Joe Edwards",
    players: [
      { name: "George Long", ovr: 84 },
      { name: "Danny McNamara", ovr: 82 },
      { name: "Jake Cooper", ovr: 83 },
      { name: "Murray Wallace", ovr: 83 },
      { name: "Scott Malone", ovr: 81 },
      { name: "Billy Mitchell", ovr: 81 },
      { name: "Ryan Leonard", ovr: 78 },
      { name: "Zian Flemming", ovr: 78 },
      { name: "Kevin Nisbet", ovr: 77 },
      { name: "Tom Bradshaw", ovr: 78 },
      { name: "Tyler Burey", ovr: 77 },
    ]
  },
  "Norwich City": {
    manager: "David Wagner",
    players: [
      { name: "Tim Krul", ovr: 84 },
      { name: "Max Aarons", ovr: 84 },
      { name: "Ben Gibson", ovr: 82 },
      { name: "Andrew Omobamidele", ovr: 82 },
      { name: "Sam McCallum", ovr: 82 },
      { name: "Kenny McLean", ovr: 81 },
      { name: "Liam Gibbs", ovr: 81 },
      { name: "Gabriel Sara", ovr: 78 },
      { name: "Jonathan Rowe", ovr: 79 },
      { name: "Josh Sargent", ovr: 76 },
      { name: "Adam Idah", ovr: 74 },
    ]
  },
  "Oxford United": {
    manager: "Des Buckingham",
    players: [
      { name: "Simon Eastwood", ovr: 84 },
      { name: "Elliott Moore", ovr: 82 },
      { name: "Steve Seddon", ovr: 84 },
      { name: "Josh Murphy", ovr: 81 },
      { name: "Josh McEachran", ovr: 81 },
      { name: "Mark Sykes", ovr: 81 },
      { name: "Marcus McGuane", ovr: 78 },
      { name: "Gatlin O'Donkor", ovr: 77 },
      { name: "Matty Taylor", ovr: 76 },
    ]
  },
  "Portsmouth": {
    manager: "John Mousinho",
    players: [
      { name: "Nicolas Schmid", ovr: 84 },
      { name: "Callum Jennings", ovr: 84 },
      { name: "Connor Ogilvie", ovr: 83 },
      { name: "Sean Raggett", ovr: 83 },
      { name: "Joe Rafferty", ovr: 81 },
      { name: "Ryan Tunnicliffe", ovr: 80 },
      { name: "Denver Hume", ovr: 80 },
      { name: "Tom Lowery", ovr: 79 },
      { name: "Louis Thompson", ovr: 76 },
      { name: "Colby Bishop", ovr: 77 },
      { name: "Josh Koroma", ovr: 78 },
    ]
  },
  "Queens Park Rangers": {
    manager: "Martí Cifuentes",
    players: [
      { name: "Asmir Begović", ovr: 83 },
      { name: "Jimmy Dunne", ovr: 85 },
      { name: "Rob Dickie", ovr: 81 },
      { name: "Jake Clarke-Salter", ovr: 83 },
      { name: "Liam Morrison", ovr: 83 },
      { name: "Albert Adomah", ovr: 79 },
      { name: "Ilias Chair", ovr: 81 },
      { name: "Chris Willock", ovr: 77 },
      { name: "Macauley Bonne", ovr: 79 },
      { name: "Charlie Austin", ovr: 79 },
      { name: "Sam Field", ovr: 75 },
    ]
  },
  "Sheffield United": {
    manager: "Chris Wilder",
    players: [
      { name: "Wes Foderingham", ovr: 86 },
      { name: "Jayden Bogle", ovr: 85 },
      { name: "Jack Robinson", ovr: 82 },
      { name: "Anel Ahmedhodzic", ovr: 84 },
      { name: "Rhys Norrington-Davies", ovr: 80 },
      { name: "John Fleck", ovr: 81 },
      { name: "Sander Berge", ovr: 79 },
      { name: "Ben Osborn", ovr: 80 },
      { name: "Rhian Brewster", ovr: 76 },
      { name: "Oli McBurnie", ovr: 78 },
      { name: "Max Lowe", ovr: 76 },
    ]
  },
  "Sheffield Wednesday": {
    manager: "Danny Röhl",
    players: [
      { name: "Cameron Dawson", ovr: 85 },
      { name: "Liam Palmer", ovr: 85 },
      { name: "Dominic Iorfa", ovr: 81 },
      { name: "Michael Ihiekwe", ovr: 82 },
      { name: "Marvin Johnson", ovr: 80 },
      { name: "Barry Bannan", ovr: 81 },
      { name: "George Byers", ovr: 80 },
      { name: "Josh Windass", ovr: 78 },
      { name: "Michael Smith", ovr: 78 },
      { name: "Lee Gregory", ovr: 78 },
      { name: "Callum Paterson", ovr: 77 },
    ]
  },
  "Southampton": {
    manager: "Russell Martin",
    players: [
      { name: "Joe Lumley", ovr: 84 },
      { name: "Tino Livramento", ovr: 83 },
      { name: "Jan Bednarek", ovr: 82 },
      { name: "Jack Stephens", ovr: 80 },
      { name: "Kyle Walker-Peters", ovr: 82 },
      { name: "Stuart Armstrong", ovr: 79 },
      { name: "Theo Walcott", ovr: 81 },
      { name: "Mohamed Elyounoussi", ovr: 79 },
      { name: "Adam Armstrong", ovr: 77 },
      { name: "Che Adams", ovr: 79 },
    ]
  },
  "Stoke City": {
    manager: "Steven Schumacher",
    players: [
      { name: "Viktor Johansson", ovr: 83 },
      { name: "Ben Wilmot", ovr: 85 },
      { name: "Phil Jagielka", ovr: 82 },
      { name: "Harry Souttar", ovr: 82 },
      { name: "Josh Tymon", ovr: 83 },
      { name: "Badou Ndiaye", ovr: 81 },
      { name: "Joe Allen", ovr: 79 },
      { name: "Sam Clucas", ovr: 77 },
      { name: "Harry Toffolo", ovr: 77 },
      { name: "Tyrese Campbell", ovr: 77 },
      { name: "Nick Powell", ovr: 74 },
    ]
  },
  "Swansea City": {
    manager: "Luke Williams",
    players: [
      { name: "Andrew Fisher", ovr: 86 },
      { name: "Ryan Manning", ovr: 85 },
      { name: "Kyle Naughton", ovr: 83 },
      { name: "Ben Cabango", ovr: 82 },
      { name: "Josh Key", ovr: 81 },
      { name: "Jay Fulton", ovr: 80 },
      { name: "Matt Grimes", ovr: 79 },
      { name: "Joel Piroe", ovr: 78 },
      { name: "Ollie Cooper", ovr: 78 },
      { name: "Michael Obafemi", ovr: 78 },
      { name: "Liam Cullen", ovr: 78 },
    ]
  },
  "Watford": {
    manager: "Valérien Ismaël",
    players: [
      { name: "Daniel Bachmann", ovr: 84 },
      { name: "Jeremy Ngakia", ovr: 85 },
      { name: "Francisco Sierralta", ovr: 83 },
      { name: "Mattie Pollock", ovr: 81 },
      { name: "Adam Masina", ovr: 83 },
      { name: "Imrân Louza", ovr: 81 },
      { name: "Tom Cleverley", ovr: 80 },
      { name: "João Pedro", ovr: 77 },
      { name: "Ken Sema", ovr: 79 },
      { name: "Ismaila Sarr", ovr: 76 },
      { name: "Vakoun Bayo", ovr: 75 },
    ]
  },
  "West Bromwich Albion": {
    manager: "Carlos Corberán",
    players: [
      { name: "Alex Palmer", ovr: 85 },
      { name: "Dara O'Shea", ovr: 82 },
      { name: "Semi Ajayi", ovr: 84 },
      { name: "Kyle Bartley", ovr: 84 },
      { name: "Conor Townsend", ovr: 82 },
      { name: "Okay Yokuslu", ovr: 81 },
      { name: "Jake Livermore", ovr: 79 },
      { name: "Jed Wallace", ovr: 77 },
      { name: "John Swift", ovr: 79 },
      { name: "Karlan Grant", ovr: 77 },
      { name: "Callum Robinson", ovr: 78 },
    ]
  },
  "Wrexham": {
    manager: "Phil Parkinson",
    players: [
      { name: "Ben Foster", ovr: 85 },
      { name: "Tom O'Connor", ovr: 84 },
      { name: "James Jones", ovr: 82 },
      { name: "Ollie Palmer", ovr: 84 },
      { name: "Jacob Mendy", ovr: 80 },
      { name: "Paul Mullin", ovr: 80 },
      { name: "Josh Moxey", ovr: 78 },
      { name: "George Dobson", ovr: 78 },
      { name: "Anthony Forde", ovr: 79 },
      { name: "Jordan Davies", ovr: 77 },
    ]
  },
  "AFC Wimbledon": {
    manager: "Johnnie Jackson",
    players: [
      { name: "Nik Tzanev", ovr: 85 },
      { name: "Josh Davison", ovr: 83 },
      { name: "Luke McCormick", ovr: 82 },
      { name: "Ali Al-Hamadi", ovr: 84 },
      { name: "Jack Currie", ovr: 79 },
    ]
  },
  "Barnsley": {
    manager: "Neill Collins",
    players: [
      { name: "Brad Collins", ovr: 85 },
      { name: "Liam Kitching", ovr: 83 },
      { name: "Mads Andersen", ovr: 82 },
      { name: "Callum Styles", ovr: 81 },
      { name: "Devante Cole", ovr: 80 },
      { name: "John Benson", ovr: 82 },
      { name: "Bobby Thomas", ovr: 80 },
    ]
  },
  "Blackpool": {
    manager: "Neil Critchley",
    players: [
      { name: "Daniel Grimshaw", ovr: 85 },
      { name: "Callum Connolly", ovr: 83 },
      { name: "Matthew Pennington", ovr: 81 },
      { name: "James Husband", ovr: 80 },
      { name: "Elliot Embleton", ovr: 81 },
      { name: "Jake Daniels", ovr: 80 },
      { name: "Shayne Lavery", ovr: 78 },
    ]
  },
  "Bolton Wanderers": {
    manager: "Ian Evatt",
    players: [
      { name: "Joel Dixon", ovr: 86 },
      { name: "Declan John", ovr: 84 },
      { name: "Alex Baptiste", ovr: 84 },
      { name: "Will Aimson", ovr: 84 },
      { name: "MJ Williams", ovr: 82 },
      { name: "Elias Kachunga", ovr: 82 },
      { name: "Dion Charles", ovr: 78 },
    ]
  },
  "Bradford City": {
    manager: "Graham Alexander",
    players: [
      { name: "Harry Lewis", ovr: 83 },
      { name: "Paudie O'Connor", ovr: 85 },
      { name: "Liam Ridehalgh", ovr: 81 },
      { name: "Romoney Crichlow", ovr: 81 },
      { name: "Adam Forshaw", ovr: 79 },
      { name: "Callum Cooke", ovr: 80 },
      { name: "Andy Cook", ovr: 79 },
    ]
  },
  "Burton Albion": {
    manager: "Martin Paterson",
    players: [
      { name: "Ben Garratt", ovr: 85 },
      { name: "Kane Hemmings", ovr: 84 },
      { name: "John Brayford", ovr: 83 },
      { name: "Tom Hamer", ovr: 81 },
      { name: "Jake Beesley", ovr: 80 },
      { name: "Sam Hughes", ovr: 82 },
    ]
  },
  "Charlton Athletic": {
    manager: "Nathan Jones",
    players: [
      { name: "Craig MacGillivray", ovr: 86 },
      { name: "Ryan Inniss", ovr: 85 },
      { name: "Miles Leaburn", ovr: 83 },
      { name: "Albie Morgan", ovr: 80 },
    ]
  },
  "Doncaster Rovers": {
    manager: "Grant McCann",
    players: [
      { name: "Ted Cann", ovr: 83 },
      { name: "Tom Anderson", ovr: 85 },
      { name: "Jackson Lam", ovr: 84 },
      { name: "James Maxwell", ovr: 83 },
      { name: "Jake Reeves", ovr: 82 },
      { name: "Taylor Richards", ovr: 82 },
    ]
  },
  "Exeter City": {
    manager: "Gary Caldwell",
    players: [
      { name: "Jamal Blackman", ovr: 83 },
      { name: "Josh Key", ovr: 83 },
      { name: "Sam Stubbs", ovr: 83 },
      { name: "Pierce Sweeney", ovr: 84 },
      { name: "Archie Collins", ovr: 81 },
      { name: "Matt Jay", ovr: 79 },
      { name: "Jevani Brown", ovr: 78 },
    ]
  },
  "Huddersfield Town": {
    manager: "Darren Moore",
    players: [
      { name: "Lee Nicholls", ovr: 85 },
      { name: "Pipa", ovr: 84 },
      { name: "Tom Lees", ovr: 83 },
      { name: "Levi Colwill", ovr: 83 },
      { name: "Josh Ruffels", ovr: 80 },
      { name: "Jonathan Hogg", ovr: 82 },
      { name: "Jack Rudoni", ovr: 81 },
      { name: "Danny Ward", ovr: 78 },
    ]
  },
  "Leyton Orient": {
    manager: "Richie Wellens",
    players: [
      { name: "Lawrence Vigouroux", ovr: 85 },
      { name: "Omar Beckles", ovr: 85 },
      { name: "Darren Pratley", ovr: 81 },
      { name: "Jordan Brown", ovr: 80 },
      { name: "Ruel Sotiriou", ovr: 83 },
    ]
  },
  "Lincoln City": {
    manager: "Michael Skubala",
    players: [
      { name: "Josh Griffiths", ovr: 84 },
      { name: "Paudie O'Connor", ovr: 84 },
      { name: "Regan Poole", ovr: 82 },
      { name: "Ben House", ovr: 81 },
      { name: "Robbie Gotts", ovr: 82 },
      { name: "Hamzat Kazeem", ovr: 79 },
    ]
  },
  "Luton Town": {
    manager: "Rob Edwards",
    players: [
      { name: "Matt Ingram", ovr: 84 },
      { name: "Kal Naismith", ovr: 82 },
      { name: "Reece Burke", ovr: 82 },
      { name: "Gabe Osho", ovr: 84 },
      { name: "Jordan Clark", ovr: 81 },
      { name: "Carlton Morris", ovr: 80 },
    ]
  },
  "Mansfield Town": {
    manager: "Nigel Clough",
    players: [
      { name: "Nathan Bishop", ovr: 86 },
      { name: "Stephen McLaughlin", ovr: 83 },
      { name: "Oli Hawkins", ovr: 82 },
      { name: "George Lapslie", ovr: 81 },
      { name: "Lucas Akins", ovr: 80 },
      { name: "Rhys Oates", ovr: 79 },
      { name: "Davis Keillor-Dunn", ovr: 79 },
    ]
  },
  "Northampton Town": {
    manager: "Jon Brady",
    players: [
      { name: "Lee Burge", ovr: 86 },
      { name: "Jon Guthrie", ovr: 83 },
      { name: "Charlie Goode", ovr: 82 },
      { name: "Sam Sherring", ovr: 83 },
      { name: "Harvey Lintott", ovr: 83 },
      { name: "Josh Eppiah", ovr: 80 },
    ]
  },
  "Peterborough United": {
    manager: "Darren Ferguson",
    players: [
      { name: "Lucas Bergström", ovr: 85 },
      { name: "Ronnie Edwards", ovr: 85 },
      { name: "Nathan Thompson", ovr: 83 },
      { name: "Emmanuel Fernández", ovr: 84 },
      { name: "Jeando Fuchs", ovr: 82 },
      { name: "Harrison Burrows", ovr: 81 },
      { name: "Ricky-Jade Jones", ovr: 80 },
    ]
  },
  "Plymouth Argyle": {
    manager: "Wayne Rooney",
    players: [
      { name: "Conor Hazard", ovr: 83 },
      { name: "James Wilson", ovr: 83 },
      { name: "Dan Scarr", ovr: 84 },
      { name: "Brendan Galloway", ovr: 84 },
      { name: "Jordan Houghton", ovr: 83 },
      { name: "Finn Azaz", ovr: 80 },
      { name: "Ryan Hardie", ovr: 80 },
    ]
  },
  "Port Vale": {
    manager: "Andy Crosby",
    players: [
      { name: "Aidan Stone", ovr: 86 },
      { name: "James Wilson", ovr: 85 },
      { name: "James Gibbons", ovr: 82 },
      { name: "Connor Hall", ovr: 84 },
      { name: "Ben Garrity", ovr: 82 },
      { name: "Ben Heneghan", ovr: 81 },
    ]
  },
  "Reading": {
    manager: "Rubén Sellés",
    players: [
      { name: "Joel Rodwell", ovr: 83 },
      { name: "Tom McIntyre", ovr: 84 },
      { name: "Nesta Guinness-Walker", ovr: 84 },
      { name: "Andy Carroll", ovr: 83 },
      { name: "Shane Long", ovr: 81 },
      { name: "Stephen Quinn", ovr: 80 },
    ]
  },
  "Rotherham United": {
    manager: "Matt Taylor",
    players: [
      { name: "Viktor Johansson", ovr: 86 },
      { name: "Wes Harding", ovr: 82 },
      { name: "Michael Ihiekwe", ovr: 84 },
      { name: "Grant Hall", ovr: 81 },
      { name: "Jamie Lindsay", ovr: 83 },
      { name: "Shaun MacDonald", ovr: 81 },
      { name: "Freddie Ladapo", ovr: 79 },
    ]
  },
  "Stevenage": {
    manager: "Steve Evans",
    players: [
      { name: "Jamie Cumming", ovr: 86 },
      { name: "Luther James-Wildin", ovr: 84 },
      { name: "Luke Prosser", ovr: 84 },
      { name: "Jamie Reid", ovr: 82 },
      { name: "Jake Reeves", ovr: 80 },
    ]
  },
  "Stockport County": {
    manager: "Dave Challinor",
    players: [
      { name: "Ben Hinchliffe", ovr: 86 },
      { name: "Ryan Rydel", ovr: 82 },
      { name: "Ash Palmer", ovr: 83 },
      { name: "Mark Kitching", ovr: 84 },
      { name: "Will Collar", ovr: 80 },
      { name: "Macauley Southam-Hales", ovr: 80 },
      { name: "Tom Elliot", ovr: 80 },
    ]
  },
  "Wigan Athletic": {
    manager: "Shaun Maloney",
    players: [
      { name: "Ben Amos", ovr: 83 },
      { name: "Joe Bennett", ovr: 83 },
      { name: "Jack Whatmough", ovr: 82 },
      { name: "Charlie Hughes", ovr: 83 },
      { name: "Max Power", ovr: 82 },
      { name: "Tom Naylor", ovr: 80 },
      { name: "Callum Lang", ovr: 78 },
    ]
  },
  "Wycombe Wanderers": {
    manager: "Matt Bloomfield",
    players: [
      { name: "David Stockdale", ovr: 86 },
      { name: "Jason McCarthy", ovr: 83 },
      { name: "Anthony Stewart", ovr: 84 },
      { name: "Garath McCleary", ovr: 82 },
      { name: "Alex Samuel", ovr: 80 },
    ]
  },
  "Accrington Stanley": {
    manager: "John Doolan",
    players: [
      { name: "Nathan Baxter", ovr: 86 },
      { name: "Ben Barclay", ovr: 86 },
      { name: "Ross Sykes", ovr: 84 },
      { name: "Tom Leigh", ovr: 83 },
      { name: "Matt Butcher", ovr: 81 },
      { name: "Tommy Leigh", ovr: 82 },
      { name: "Liam Coyle", ovr: 79 },
    ]
  },
  "Barnet": {
    manager: "Andy Woodman",
    players: [
      { name: "Jamie Cumming", ovr: 83 },
      { name: "Ephraim Yeboah", ovr: 82 },
      { name: "Lee Swaby", ovr: 82 },
      { name: "Ayo Obileye", ovr: 81 },
      { name: "Michael Switzer", ovr: 80 },
      { name: "James Baxendale", ovr: 81 },
    ]
  },
  "Barrow": {
    manager: "Stephen Clemence",
    players: [
      { name: "Ryan Ne", ovr: 84 },
      { name: "Nathan Cameron", ovr: 86 },
      { name: "Liam Hogan", ovr: 81 },
      { name: "Remeao Hutton", ovr: 80 },
      { name: "Kgosi Ntlhe", ovr: 83 },
      { name: "Josh Gordon", ovr: 79 },
      { name: "Patrick Brough", ovr: 79 },
    ]
  },
  "Bristol Rovers": {
    manager: "Matt Taylor",
    players: [
      { name: "James Belshaw", ovr: 83 },
      { name: "Luca Hoole", ovr: 83 },
      { name: "Cian Harries", ovr: 83 },
      { name: "Sam Finley", ovr: 82 },
      { name: "James Connolly", ovr: 80 },
      { name: "Antony Evans", ovr: 80 },
    ]
  },
  "Cambridge United": {
    manager: "Neil Harris",
    players: [
      { name: "Dimitar Mitov", ovr: 83 },
      { name: "Jack Iredale", ovr: 85 },
      { name: "Lloyd Jones", ovr: 84 },
      { name: "Ben Worman", ovr: 83 },
      { name: "Harvey Knibbs", ovr: 82 },
      { name: "Sam Smith", ovr: 80 },
    ]
  },
  "Cheltenham Town": {
    manager: "Darrell Clarke",
    players: [
      { name: "Owen Evans", ovr: 86 },
      { name: "Ben Tozer", ovr: 84 },
      { name: "George Lloyd", ovr: 82 },
      { name: "Aaron Ramsey", ovr: 83 },
      { name: "Ryan Jackson", ovr: 83 },
      { name: "Mattie Pollock", ovr: 81 },
    ]
  },
  "Chesterfield": {
    manager: "Paul Cook",
    players: [
      { name: "Tommy Andrews", ovr: 85 },
      { name: "Carl Dickinson", ovr: 84 },
      { name: "Tom Warren", ovr: 84 },
      { name: "Joe Quigley", ovr: 82 },
      { name: "Dylan Mottley-Henry", ovr: 79 },
    ]
  },
  "Colchester United": {
    manager: "Danny Cowley",
    players: [
      { name: "Jake Turner", ovr: 86 },
      { name: "Lyle Taylor", ovr: 82 },
      { name: "Noah Chilvers", ovr: 82 },
      { name: "Freddie Sears", ovr: 82 },
      { name: "Brendan Wiredu", ovr: 82 },
    ]
  },
  "Crawley Town": {
    manager: "Scott Lindsey",
    players: [
      { name: "Glenn Morris", ovr: 84 },
      { name: "Danilo Orsi", ovr: 83 },
      { name: "Tom Nichols", ovr: 84 },
      { name: "Jack Roles", ovr: 84 },
      { name: "Kellan Gordon", ovr: 81 },
    ]
  },
  "Crewe Alexandra": {
    manager: "Alex Morris",
    players: [
      { name: "Dave Richards", ovr: 83 },
      { name: "Chris Long", ovr: 85 },
      { name: "Eli King", ovr: 82 },
      { name: "Daniel Agyei", ovr: 80 },
      { name: "Harry Pickering", ovr: 81 },
    ]
  },
  "Fleetwood Town": {
    manager: "Lee Johnson",
    players: [
      { name: "Alex Cairns", ovr: 84 },
      { name: "Callum Connolly", ovr: 84 },
      { name: "Tom Clarke", ovr: 84 },
      { name: "Paddy Lane", ovr: 82 },
      { name: "Callum Morton", ovr: 80 },
    ]
  },
  "Gillingham": {
    manager: "Stephen Clemence",
    players: [
      { name: "Glenn Morris", ovr: 85 },
      { name: "Jack Tucker", ovr: 84 },
      { name: "Robbie McKenzie", ovr: 81 },
      { name: "Jordan Graham", ovr: 82 },
      { name: "Olly Lee", ovr: 80 },
    ]
  },
  "Grimsby Town": {
    manager: "David Artell",
    players: [
      { name: "Max Crocombe", ovr: 85 },
      { name: "Giles Coke", ovr: 84 },
      { name: "Michee Efete", ovr: 83 },
      { name: "Harry Clifton", ovr: 81 },
      { name: "John McAtee", ovr: 80 },
    ]
  },
  "Harrogate Town": {
    manager: "Simon Weaver",
    players: [
      { name: "Mark Oxley", ovr: 86 },
      { name: "Warren Burrell", ovr: 84 },
      { name: "Josh Falkingham", ovr: 85 },
      { name: "Simon Power", ovr: 81 },
      { name: "Jack Muldoon", ovr: 82 },
    ]
  },
  "Milton Keynes Dons": {
    manager: "Mike Williamson",
    players: [
      { name: "Andrew Fisher", ovr: 85 },
      { name: "Dean Lewington", ovr: 83 },
      { name: "Zak Jules", ovr: 85 },
      { name: "Max Dean", ovr: 82 },
      { name: "Alex Gilbey", ovr: 80 },
    ]
  },
  "Newport County": {
    manager: "Graham Coughlan",
    players: [
      { name: "Tom King", ovr: 83 },
      { name: "Priestley Farquharson", ovr: 83 },
      { name: "Lewis Collins", ovr: 82 },
      { name: "Jamie Proctor", ovr: 82 },
      { name: "Antwoine Hackford", ovr: 83 },
    ]
  },
  "Notts County": {
    manager: "Stuart Maynard",
    players: [
      { name: "Ethan Ross", ovr: 83 },
      { name: "Jose Lapo", ovr: 82 },
      { name: "Richard Tait", ovr: 83 },
      { name: "Jobi McAnuff", ovr: 83 },
      { name: "Kyle Cameron", ovr: 80 },
    ]
  },
  "Oldham Athletic": {
    manager: "Micky Mellon",
    players: [
      { name: "Harry Draper", ovr: 86 },
      { name: "Will Sutton", ovr: 83 },
      { name: "Tom Muldoon", ovr: 82 },
      { name: "Jordan Slew", ovr: 82 },
    ]
  },
  "Salford City": {
    manager: "Karl Robinson",
    players: [
      { name: "Tom King", ovr: 84 },
      { name: "Liam Shephard", ovr: 82 },
      { name: "Tyrese Fornah", ovr: 83 },
      { name: "Matt Lund", ovr: 82 },
      { name: "Brandon Thomas-Asante", ovr: 81 },
    ]
  },
  "Shrewsbury Town": {
    manager: "Paul Hurst",
    players: [
      { name: "Marko Marosi", ovr: 83 },
      { name: "Cian Harries", ovr: 84 },
      { name: "Rekeil Pyke", ovr: 83 },
      { name: "Tom Bloxham", ovr: 82 },
      { name: "Josh Vela", ovr: 82 },
    ]
  },
  "Swindon Town": {
    manager: "Michael Flynn",
    players: [
      { name: "Jojo Wollacott", ovr: 83 },
      { name: "Dion Conroy", ovr: 85 },
      { name: "Aidan O'Brien", ovr: 85 },
      { name: "Sol Brynn", ovr: 80 },
      { name: "Jordan Lyden", ovr: 79 },
    ]
  },
  "Tranmere Rovers": {
    manager: "Nigel Adkins",
    players: [
      { name: "Joe Murphy", ovr: 85 },
      { name: "Peter Clarke", ovr: 83 },
      { name: "Kieron Morris", ovr: 82 },
      { name: "Jay McEveley", ovr: 82 },
      { name: "Corey Blackett-Taylor", ovr: 81 },
    ]
  },
  "Walsall": {
    manager: "Mat Sadler",
    players: [
      { name: "Liam Roberts", ovr: 85 },
      { name: "Jack Earing", ovr: 83 },
      { name: "Brendan Kiernan", ovr: 84 },
      { name: "Caolan Boyd-Munce", ovr: 81 },
      { name: "Conor Wilkinson", ovr: 83 },
    ]
  },
  "Atletico Madrid": {
    manager: "Diego Simeone",
    players: [
      { name: "Jan Oblak", ovr: 90 },
      { name: "Nahuel Molina", ovr: 88 },
      { name: "José Giménez", ovr: 89 },
      { name: "Robin Le Normand", ovr: 89 },
      { name: "Reinildo", ovr: 89 },
      { name: "Marcos Llorente", ovr: 87 },
      { name: "Koke", ovr: 84 },
      { name: "Pablo Barrios", ovr: 84 },
      { name: "Ángel Correa", ovr: 83 },
      { name: "Julián Álvarez", ovr: 84 },
      { name: "Antoine Griezmann", ovr: 82 },
      { name: "Álvaro Morata", ovr: 84 },
      { name: "Rodrigo De Paul", ovr: 84 },
      { name: "Memphis Depay", ovr: 81 },
    ]
  },
  "Athletic Bilbao": {
    manager: "Ernesto Valverde",
    players: [
      { name: "Unai Simón", ovr: 83 },
      { name: "Ander Capa", ovr: 82 },
      { name: "Dani Vivian", ovr: 81 },
      { name: "Aitor Paredes", ovr: 82 },
      { name: "Yuri Berchiche", ovr: 83 },
      { name: "Mikel Vesga", ovr: 81 },
      { name: "Dani García", ovr: 81 },
      { name: "Oihan Sancet", ovr: 77 },
      { name: "Williams Nico", ovr: 76 },
      { name: "Williams Iñaki", ovr: 78 },
      { name: "Berenguer Álex", ovr: 76 },
      { name: "Yeray Álvarez", ovr: 75 },
      { name: "Iker Muniain", ovr: 76 },
      { name: "Gorka Guruzeta", ovr: 73 },
    ]
  },
  "Alaves": {
    manager: "Eduardo Coudet",
    players: [
      { name: "Antonio Sivera", ovr: 85 },
      { name: "Luis Rioja", ovr: 85 },
      { name: "Manu García", ovr: 82 },
      { name: "Victor Laguardia", ovr: 83 },
      { name: "Abqar Mouane", ovr: 79 },
      { name: "Jon Guridi", ovr: 82 },
      { name: "Tomás Conechny", ovr: 80 },
    ]
  },
  "Barcelona": {
    manager: "Hansi Flick",
    players: [
      { name: "Marc-André ter Stegen", ovr: 88 },
      { name: "Iñigo Martínez", ovr: 90 },
      { name: "Ronald Araújo", ovr: 86 },
      { name: "Jules Koundé", ovr: 89 },
      { name: "Alejandro Balde", ovr: 86 },
      { name: "Frenkie de Jong", ovr: 88 },
      { name: "Pedri", ovr: 85 },
      { name: "Gavi", ovr: 85 },
      { name: "Lamine Yamal", ovr: 85 },
      { name: "Robert Lewandowski", ovr: 85 },
      { name: "Raphinha", ovr: 83 },
      { name: "Fermín López", ovr: 81 },
      { name: "Pau Cubarsí", ovr: 81 },
      { name: "Dani Olmo", ovr: 84 },
    ]
  },
  "Celta Vigo": {
    manager: "Claudio Giráldez",
    players: [
      { name: "Vicente Guaita", ovr: 84 },
      { name: "Kevin Vázquez", ovr: 85 },
      { name: "Unai Núñez", ovr: 83 },
      { name: "Carl Starfelt", ovr: 82 },
      { name: "Jailson", ovr: 79 },
      { name: "Fran Beltrán", ovr: 80 },
      { name: "Renato Tapia", ovr: 78 },
      { name: "Oscar Mingueza", ovr: 77 },
      { name: "Williot Swedberg", ovr: 80 },
      { name: "Iago Aspas", ovr: 77 },
      { name: "Anastasios Douvikas", ovr: 76 },
    ]
  },
  "Espanyol": {
    manager: "Manolo González",
    players: [
      { name: "Joan García", ovr: 86 },
      { name: "Leandro Cabrera", ovr: 85 },
      { name: "Sergi Gómez", ovr: 84 },
      { name: "Brian Oliván", ovr: 84 },
      { name: "Pol Lozano", ovr: 80 },
      { name: "Aleix Vidal", ovr: 81 },
      { name: "Javi Puado", ovr: 81 },
      { name: "Carlos Romero", ovr: 80 },
    ]
  },
  "Elche": {
    manager: "Eder Sarabia",
    players: [
      { name: "Kiko Casilla", ovr: 86 },
      { name: "Gonzalo Verdú", ovr: 83 },
      { name: "Jorge Almirón", ovr: 83 },
      { name: "Patrick", ovr: 81 },
      { name: "Álex Collado", ovr: 80 },
      { name: "Pol Mikel", ovr: 82 },
    ]
  },
  "Getafe": {
    manager: "José Bordalás",
    players: [
      { name: "David Soria", ovr: 85 },
      { name: "Dakonam Djené", ovr: 83 },
      { name: "Óscar Fraile", ovr: 84 },
      { name: "Domingos Duarte", ovr: 81 },
      { name: "Gastón Álvarez", ovr: 80 },
      { name: "Munir El Haddadi", ovr: 79 },
      { name: "Jaime Mata", ovr: 81 },
    ]
  },
  "Girona": {
    manager: "Míchel",
    players: [
      { name: "Paulo Gazzaniga", ovr: 86 },
      { name: "Arnau Martínez", ovr: 83 },
      { name: "David López", ovr: 82 },
      { name: "Ladislav Krejčí", ovr: 82 },
      { name: "Miguel Gutiérrez", ovr: 81 },
      { name: "Oriol Romeu", ovr: 79 },
      { name: "Yangel Herrera", ovr: 80 },
      { name: "Iván Martín", ovr: 79 },
      { name: "Savinho", ovr: 76 },
      { name: "Artem Dovbyk", ovr: 75 },
      { name: "Taty Castellanos", ovr: 76 },
      { name: "Abel Ruiz", ovr: 74 },
      { name: "Jhon Solís", ovr: 76 },
      { name: "Bryan Gil", ovr: 73 },
    ]
  },
  "Levante": {
    manager: "Luís Castro",
    players: [
      { name: "Andrés Fernández", ovr: 84 },
      { name: "Pepelu", ovr: 85 },
      { name: "Óscar Duarte", ovr: 84 },
      { name: "José Campaña", ovr: 81 },
      { name: "Roger Martí", ovr: 81 },
      { name: "Coke", ovr: 82 },
    ]
  },
  "Mallorca": {
    manager: "Jagoba Arrasate",
    players: [
      { name: "Predrag Rajković", ovr: 86 },
      { name: "Maffeo", ovr: 83 },
      { name: "Antonio Raillo", ovr: 81 },
      { name: "Miguel Ángel Asensio", ovr: 81 },
      { name: "Jaume Costa", ovr: 81 },
      { name: "Iddrisu Baba", ovr: 79 },
      { name: "Dani Rodríguez", ovr: 79 },
      { name: "Abdón Prats", ovr: 78 },
      { name: "Vedat Muriqi", ovr: 79 },
      { name: "Lee Kang-in", ovr: 77 },
    ]
  },
  "Osasuna": {
    manager: "Alessio Lisci",
    players: [
      { name: "Sergio Herrera", ovr: 85 },
      { name: "Nacho Vidal", ovr: 82 },
      { name: "Aridane", ovr: 84 },
      { name: "David García", ovr: 83 },
      { name: "Juan Cruz", ovr: 81 },
      { name: "Darko Brasanac", ovr: 79 },
      { name: "Lucas Torró", ovr: 79 },
      { name: "Rubén García", ovr: 79 },
      { name: "Ante Budimir", ovr: 79 },
      { name: "Ezequiel Ávila", ovr: 79 },
    ]
  },
  "Rayo Vallecano": {
    manager: "Iñigo Pérez",
    players: [
      { name: "Stole Dimitrievski", ovr: 83 },
      { name: "Balliu", ovr: 82 },
      { name: "Lecomte", ovr: 82 },
      { name: "Íñigo López", ovr: 83 },
      { name: "Isi Palazón", ovr: 80 },
      { name: "Álvaro García", ovr: 82 },
      { name: "Raúl de Tomás", ovr: 80 },
      { name: "Randy Nteka", ovr: 78 },
    ]
  },
  "Real Betis": {
    manager: "Manuel Pellegrini",
    players: [
      { name: "Rui Silva", ovr: 83 },
      { name: "Héctor Bellerín", ovr: 83 },
      { name: "Germán Pezzella", ovr: 83 },
      { name: "Natan", ovr: 81 },
      { name: "Álex Moreno", ovr: 80 },
      { name: "William Carvalho", ovr: 82 },
      { name: "Guido Rodríguez", ovr: 78 },
      { name: "Antony", ovr: 79 },
      { name: "Isco", ovr: 76 },
      { name: "Ayoze Pérez", ovr: 77 },
      { name: "Juan Miranda", ovr: 75 },
      { name: "Assane Diao", ovr: 75 },
      { name: "Pablo Fornals", ovr: 76 },
    ]
  },
  "Real Madrid": {
    manager: "Álvaro Arbeloa",
    players: [
      { name: "Thibaut Courtois", ovr: 94 },
      { name: "Dani Carvajal", ovr: 92 },
      { name: "Antonio Rüdiger", ovr: 93 },
      { name: "Ferland Mendy", ovr: 89 },
      { name: "Aurélien Tchouaméni", ovr: 90 },
      { name: "Eduardo Camavinga", ovr: 91 },
      { name: "Jude Bellingham", ovr: 90 },
      { name: "Federico Valverde", ovr: 88 },
      { name: "Kylian Mbappé", ovr: 89 },
      { name: "Vinícius Júnior", ovr: 86 },
      { name: "Álvaro Carreras", ovr: 86 },
      { name: "Arda Güler", ovr: 87 },
      { name: "Rodrygo", ovr: 83 },
    ]
  },
  "Real Oviedo": {
    manager: "Guillermo Almada",
    players: [
      { name: "Alfonso Herrero", ovr: 83 },
      { name: "Pablo Ibáñez", ovr: 84 },
      { name: "Nahuel Tenaglia", ovr: 83 },
      { name: "Miguel de la Fuente", ovr: 84 },
      { name: "Lucas Ahijado", ovr: 82 },
      { name: "Colombatto", ovr: 80 },
      { name: "Carlos Dotor", ovr: 81 },
    ]
  },
  "Real Sociedad": {
    manager: "Ion Ansotegi (interim)",
    players: [
      { name: "Álex Remiro", ovr: 83 },
      { name: "Aritz Elustondo", ovr: 82 },
      { name: "Igor Zubeldia", ovr: 82 },
      { name: "Aihen Muñoz", ovr: 83 },
      { name: "Roberto López", ovr: 83 },
      { name: "Mikel Merino", ovr: 79 },
      { name: "Brais Méndez", ovr: 80 },
      { name: "Take Kubo", ovr: 79 },
      { name: "Mikel Oyarzabal", ovr: 78 },
      { name: "Ander Barrenetxea", ovr: 76 },
      { name: "Óliver Torres", ovr: 76 },
    ]
  },
  "Sevilla": {
    manager: "Matías Almeyda",
    players: [
      { name: "Yassine Bounou", ovr: 86 },
      { name: "Jesús Navas", ovr: 83 },
      { name: "Loïc Badé", ovr: 83 },
      { name: "Tanguy Nianzou", ovr: 82 },
      { name: "Marcos Acuña", ovr: 80 },
      { name: "Ivan Rakitić", ovr: 82 },
      { name: "Lucà Laribi", ovr: 78 },
      { name: "Suso", ovr: 80 },
      { name: "Theo Sainson", ovr: 77 },
      { name: "Youssef En-Nesyri", ovr: 76 },
      { name: "Dodi Lukébakio", ovr: 75 },
    ]
  },
  "Valencia": {
    manager: "Carlos Corberán",
    players: [
      { name: "Giorgi Mamardashvili", ovr: 84 },
      { name: "Thierry Correia", ovr: 82 },
      { name: "Eray Cömert", ovr: 84 },
      { name: "Yareksy Pino", ovr: 81 },
      { name: "Hugo Guillamón", ovr: 80 },
      { name: "Pepelu", ovr: 82 },
      { name: "Javier Guerra", ovr: 80 },
      { name: "Ilaix Moriba", ovr: 78 },
      { name: "Hugo Duro", ovr: 80 },
    ]
  },
  "Villarreal": {
    manager: "Marcelino",
    players: [
      { name: "Diego Conde", ovr: 84 },
      { name: "Kiko Femenía", ovr: 84 },
      { name: "Raúl Albiol", ovr: 81 },
      { name: "Pau Torres", ovr: 80 },
      { name: "Alfonso Pedraza", ovr: 81 },
      { name: "Étienne Capoue", ovr: 79 },
      { name: "Dani Parejo", ovr: 81 },
      { name: "Manu Trigueros", ovr: 79 },
      { name: "Yeremy Pino", ovr: 79 },
      { name: "José Luis Morales", ovr: 75 },
      { name: "Gerard Moreno", ovr: 78 },
      { name: "Alberto Moreno", ovr: 75 },
      { name: "Arnaut Danjuma", ovr: 73 },
    ]
  },
  "Racing de Santander": {
    manager: "José Alberto López",
    players: [
      { name: "Alberto García", ovr: 85 },
      { name: "José Arnaiz", ovr: 84 },
      { name: "Ander Guevara", ovr: 82 },
    ]
  },
  "CD Tenerife": {
    manager: "Asier Garitano",
    players: [
      { name: "Tomeu Nadal", ovr: 86 },
      { name: "Carlos Ruiz", ovr: 83 },
      { name: "Samuel Shashoua", ovr: 82 },
    ]
  },
  "Leganés": {
    manager: "Borja Jiménez",
    players: [
      { name: "Django Matsen", ovr: 86 },
      { name: "Sergio González", ovr: 85 },
      { name: "Aitor Paredes", ovr: 82 },
    ]
  },
  "Burgos CF": {
    manager: "Bolo",
    players: [
      { name: "Andrés Fernández", ovr: 83 },
      { name: "Atienza", ovr: 85 },
      { name: "Guido Carrillo", ovr: 83 },
    ]
  },
  "Real Zaragoza": {
    manager: "Fran Escribá",
    players: [
      { name: "Cristian Álvarez", ovr: 83 },
      { name: "Fran Gámez", ovr: 83 },
      { name: "Eugeni Valderrama", ovr: 83 },
    ]
  },
  "Real Valladolid": {
    manager: "Paulo Pezzolano",
    players: [
      { name: "Jordi Masip", ovr: 83 },
      { name: "Luis Pérez", ovr: 85 },
      { name: "Raúl Moro", ovr: 81 },
    ]
  },
  "Sporting Gijón": {
    manager: "Miguel Ángel Ramírez",
    players: [
      { name: "Juan Carlos", ovr: 86 },
      { name: "Gaspar Campos", ovr: 82 },
      { name: "Aitor García", ovr: 82 },
    ]
  },
  "Granada CF": {
    manager: "Paco López",
    players: [
      { name: "Maximize Johansson", ovr: 84 },
      { name: "Víctor Díaz", ovr: 82 },
      { name: "Antonio Puertas", ovr: 84 },
    ]
  },
  "Almería": {
    manager: "Pepe Mel",
    players: [
      { name: "Lukas Horak", ovr: 86 },
      { name: "Chumi", ovr: 84 },
      { name: "El Bilal Touré", ovr: 81 },
    ]
  },
  "Las Palmas": {
    manager: "García Pimienta",
    players: [
      { name: "Álvaro Valles", ovr: 84 },
      { name: "Matías Mier", ovr: 82 },
      { name: "Sandro Ramírez", ovr: 81 },
    ]
  },
  "Albacete BP": {
    manager: "Rubén Albés",
    players: [
      { name: "Bernabé Barragán", ovr: 84 },
      { name: "Ненад Кришти", ovr: 85 },
    ]
  },
  "SD Huesca": {
    manager: "Antonio Hidalgo",
    players: [
      { name: "Pablo Ganet", ovr: 85 },
      { name: "Borja García", ovr: 82 },
      { name: "Ferrán Jutglà", ovr: 84 },
    ]
  },
  "Ponferradina": {
    manager: "Juanfran García",
    players: [
      { name: "Miguel Ángel Ruiz", ovr: 86 },
      { name: "David Soto", ovr: 84 },
    ]
  },
  "Villarreal B": {
    manager: "Miguel Álvarez",
    players: [
      { name: "Joao Filipe", ovr: 85 },
      { name: "Manu Vallejo", ovr: 83 },
    ]
  },
  "UD Ibiza": {
    manager: "Onésimo Sánchez",
    players: [
      { name: "Xabi Etxeita", ovr: 86 },
      { name: "Stoichkov Luben", ovr: 84 },
    ]
  },
  "SD Eibar": {
    manager: "Joseba Etxeberria",
    players: [
      { name: "Marko Dmitrovic", ovr: 83 },
      { name: "Pape Diaw", ovr: 83 },
    ]
  },
  "FC Augsburg": {
    manager: "Jess Thorup",
    players: [
      { name: "Finn Dahmen", ovr: 85 },
      { name: "Maximilian Bauer", ovr: 85 },
      { name: "Jeffrey Gouweleeuw", ovr: 84 },
      { name: "Robert Gumny", ovr: 80 },
      { name: "Elvis Rexhbecaj", ovr: 79 },
      { name: "Arne Maier", ovr: 81 },
      { name: "Ermedin Demirović", ovr: 79 },
      { name: "Daniel Caligiuri", ovr: 77 },
    ]
  },
  "Bayer Leverkusen": {
    manager: "Xabi Alonso",
    players: [
      { name: "Lukáš Hrádecký", ovr: 85 },
      { name: "Jeremie Frimpong", ovr: 83 },
      { name: "Edmond Tapsoba", ovr: 81 },
      { name: "Jonathan Tah", ovr: 82 },
      { name: "Alejandro Grimaldo", ovr: 82 },
      { name: "Granit Xhaka", ovr: 80 },
      { name: "Robert Andrich", ovr: 81 },
      { name: "Florian Wirtz", ovr: 80 },
      { name: "Jonas Hofmann", ovr: 79 },
      { name: "Patrik Schick", ovr: 75 },
      { name: "Victor Boniface", ovr: 78 },
      { name: "Exequiel Palacios", ovr: 76 },
      { name: "Amine Adli", ovr: 73 },
      { name: "Odilon Kossounou", ovr: 73 },
    ]
  },
  "Bayern Munich": {
    manager: "Vincent Kompany",
    players: [
      { name: "Manuel Neuer", ovr: 92 },
      { name: "Noussair Mazraoui", ovr: 91 },
      { name: "Dayot Upamecano", ovr: 90 },
      { name: "Kim Min-jae", ovr: 91 },
      { name: "Alphonso Davies", ovr: 90 },
      { name: "Joshua Kimmich", ovr: 89 },
      { name: "Leon Goretzka", ovr: 90 },
      { name: "Jamal Musiala", ovr: 88 },
      { name: "Thomas Müller", ovr: 85 },
      { name: "Harry Kane", ovr: 87 },
      { name: "Leroy Sané", ovr: 86 },
      { name: "Kingsley Coman", ovr: 87 },
      { name: "Konrad Laimer", ovr: 83 },
      { name: "Serge Gnabry", ovr: 85 },
    ]
  },
  "Borussia Dortmund": {
    manager: "Niko Kovač",
    players: [
      { name: "Gregor Kobel", ovr: 91 },
      { name: "Julian Ryerson", ovr: 88 },
      { name: "Niklas Süle", ovr: 90 },
      { name: "Nico Schlotterbeck", ovr: 87 },
      { name: "Ian Maatsen", ovr: 88 },
      { name: "Emre Can", ovr: 87 },
      { name: "Felix Nmecha", ovr: 84 },
      { name: "Marcel Sabitzer", ovr: 86 },
      { name: "Karim Adeyemi", ovr: 84 },
      { name: "Serhou Guirassy", ovr: 84 },
      { name: "Julian Brandt", ovr: 83 },
      { name: "Ramy Bensebaini", ovr: 82 },
      { name: "Giovanni Reyna", ovr: 84 },
    ]
  },
  "Borussia Mönchengladbach": {
    manager: "Gerardo Seoane",
    players: [
      { name: "Moritz Nicolas", ovr: 83 },
      { name: "Stefan Lainer", ovr: 84 },
      { name: "Ko Itakura", ovr: 82 },
      { name: "Nico Elvedi", ovr: 81 },
      { name: "Ramy Bensebaini", ovr: 82 },
      { name: "Florian Neuhaus", ovr: 78 },
      { name: "Manu Koné", ovr: 79 },
      { name: "Jonas Omlin", ovr: 77 },
      { name: "Tim Kleindienst", ovr: 78 },
      { name: "Haris Tabakovic", ovr: 77 },
      { name: "Alassane Plea", ovr: 76 },
    ]
  },
  "Eintracht Frankfurt": {
    manager: "Dino Toppmöller",
    players: [
      { name: "Kevin Trapp", ovr: 83 },
      { name: "Tuta", ovr: 83 },
      { name: "Evan Ndicka", ovr: 83 },
      { name: "Willian Pacho", ovr: 83 },
      { name: "David Abraham", ovr: 82 },
      { name: "Sebastian Rode", ovr: 80 },
      { name: "Mario Götze", ovr: 79 },
      { name: "Jesper Lindstrom", ovr: 79 },
      { name: "Rafael Santos Borré", ovr: 78 },
      { name: "Randal Kolo Muani", ovr: 77 },
      { name: "Robin Koch", ovr: 76 },
      { name: "Hugo Larsson", ovr: 77 },
      { name: "Jonathan Burke", ovr: 73 },
    ]
  },
  "FC St. Pauli": {
    manager: "Fabian Hürzeler",
    players: [
      { name: "Nikola Vasilj", ovr: 85 },
      { name: "Adam Dzwigala", ovr: 84 },
      { name: "Jakov Medic", ovr: 84 },
      { name: "Hauke Wahl", ovr: 82 },
      { name: "Karol Mets", ovr: 83 },
      { name: "Marcel Hartel", ovr: 82 },
      { name: "Jackson Irvine", ovr: 78 },
      { name: "David Otto", ovr: 77 },
      { name: "Oladapo Afolabi", ovr: 78 },
      { name: "Elias Saad", ovr: 75 },
      { name: "Johannes Eggestein", ovr: 78 },
    ]
  },
  "1. FC Heidenheim": {
    manager: "Frank Schmidt",
    players: [
      { name: "Kevin Müller", ovr: 84 },
      { name: "Jonas Föhrenbach", ovr: 83 },
      { name: "Patrick Mainka", ovr: 83 },
      { name: "Lennard Maloney", ovr: 80 },
      { name: "Jan Schöppner", ovr: 82 },
      { name: "Florian Pick", ovr: 80 },
      { name: "Paul Wanner", ovr: 78 },
      { name: "Nikola Dovedan", ovr: 78 },
      { name: "Denis Thomalla", ovr: 77 },
    ]
  },
  "Hamburger SV": {
    manager: "Tim Walter",
    players: [
      { name: "Daniel Heuer Fernandes", ovr: 84 },
      { name: "Moritz Heyer", ovr: 82 },
      { name: "Miro Muheim", ovr: 84 },
      { name: "Jonas David", ovr: 84 },
      { name: "Mario Vuskovic", ovr: 80 },
      { name: "Ludovit Reis", ovr: 82 },
      { name: "Levin Öztunali", ovr: 78 },
      { name: "Anssi Suhonen", ovr: 79 },
      { name: "Laszlo Benes", ovr: 77 },
      { name: "Robert Glatzel", ovr: 78 },
      { name: "Ransford-Yeboah Königsdörffer", ovr: 78 },
    ]
  },
  "TSG Hoffenheim": {
    manager: "Pellegrino Matarazzo",
    players: [
      { name: "Oliver Baumann", ovr: 83 },
      { name: "Kevin Vogt", ovr: 83 },
      { name: "Stefan Posch", ovr: 82 },
      { name: "Grischa Prömel", ovr: 81 },
      { name: "Angelo Stiller", ovr: 79 },
      { name: "Andrej Kramarić", ovr: 82 },
      { name: "Christoph Baumgartner", ovr: 78 },
      { name: "Georginio Rutter", ovr: 78 },
      { name: "Valentino Lazaro", ovr: 79 },
      { name: "Fisnik Asllani", ovr: 77 },
    ]
  },
  "1. FC Köln": {
    manager: "Steffen Baumgart",
    players: [
      { name: "Marvin Schwäbe", ovr: 83 },
      { name: "Timo Hübers", ovr: 82 },
      { name: "Jeff Chabot", ovr: 84 },
      { name: "Jonas Hector", ovr: 81 },
      { name: "Benno Schmitz", ovr: 81 },
      { name: "Florian Kainz", ovr: 81 },
      { name: "Davie Selke", ovr: 80 },
      { name: "Dejan Ljubicic", ovr: 80 },
      { name: "Jan Thielmann", ovr: 77 },
      { name: "Steffen Tigges", ovr: 76 },
    ]
  },
  "RB Leipzig": {
    manager: "Marco Rose",
    players: [
      { name: "Peter Gulacsi", ovr: 83 },
      { name: "Willi Orbán", ovr: 84 },
      { name: "Mohamed Simakan", ovr: 82 },
      { name: "David Raum", ovr: 82 },
      { name: "Xaver Schlager", ovr: 82 },
      { name: "Kevin Kampl", ovr: 82 },
      { name: "Amadou Haidara", ovr: 80 },
      { name: "Timo Werner", ovr: 78 },
      { name: "Loïs Openda", ovr: 77 },
      { name: "Benjamin Šeško", ovr: 77 },
      { name: "Nicolas Seiwald", ovr: 76 },
    ]
  },
  "Mainz 05": {
    manager: "Bo Svensson",
    players: [
      { name: "Robin Zentner", ovr: 84 },
      { name: "Stefan Bell", ovr: 83 },
      { name: "Andreas Hanche-Olsen", ovr: 81 },
      { name: "Aaron Caricol", ovr: 81 },
      { name: "Silvan Widmer", ovr: 81 },
      { name: "Dominik Kohr", ovr: 81 },
      { name: "Danny da Costa", ovr: 78 },
      { name: "Nadiem Amiri", ovr: 80 },
      { name: "Leandro Barreiro", ovr: 77 },
      { name: "Jonathan Burkardt", ovr: 76 },
      { name: "Karim Onisiwo", ovr: 75 },
    ]
  },
  "SC Freiburg": {
    manager: "Christian Streich",
    players: [
      { name: "Noah Atubolu", ovr: 84 },
      { name: "Lukas Kübler", ovr: 82 },
      { name: "Matthias Ginter", ovr: 84 },
      { name: "Manuel Gulde", ovr: 84 },
      { name: "Christian Günter", ovr: 83 },
      { name: "Maximilian Eggestein", ovr: 80 },
      { name: "Nicolas Höfler", ovr: 80 },
      { name: "Ritsu Doan", ovr: 77 },
      { name: "Lucas Höler", ovr: 78 },
      { name: "Michael Gregoritsch", ovr: 78 },
      { name: "Roland Sallai", ovr: 78 },
    ]
  },
  "Union Berlin": {
    manager: "Nenad Bjelica",
    players: [
      { name: "Frederik Rönnow", ovr: 84 },
      { name: "Timo Baumgartl", ovr: 83 },
      { name: "Danilho Doekhi", ovr: 83 },
      { name: "Paul Jaeckel", ovr: 81 },
      { name: "Christopher Trimmel", ovr: 82 },
      { name: "Rani Khedira", ovr: 82 },
      { name: "Aïssa Laïdouni", ovr: 79 },
      { name: "Sheraldo Becker", ovr: 80 },
      { name: "Janik Haberer", ovr: 76 },
      { name: "Kevin Behrens", ovr: 77 },
      { name: "Jordan Siebatcheu", ovr: 78 },
    ]
  },
  "VfB Stuttgart": {
    manager: "Sebastian Hoeneß",
    players: [
      { name: "Alexander Nübel", ovr: 83 },
      { name: "Pascal Stenzel", ovr: 83 },
      { name: "Dan-Axel Zagadou", ovr: 84 },
      { name: "Hiroki Ito", ovr: 81 },
      { name: "Maximilian Mittelstädt", ovr: 80 },
      { name: "Atakan Karazor", ovr: 78 },
      { name: "Angelo Stiller", ovr: 78 },
      { name: "Enzo Millot", ovr: 79 },
      { name: "Chris Führich", ovr: 77 },
      { name: "Deniz Undav", ovr: 76 },
      { name: "Silas Katompa", ovr: 75 },
    ]
  },
  "Werder Bremen": {
    manager: "Ole Werner",
    players: [
      { name: "Jiri Pavlenka", ovr: 84 },
      { name: "Mitchell Weiser", ovr: 84 },
      { name: "Niklas Stark", ovr: 83 },
      { name: "Miloš Veljković", ovr: 80 },
      { name: "Anthony Jung", ovr: 80 },
      { name: "Christian Groß", ovr: 80 },
      { name: "Jens Stage", ovr: 78 },
      { name: "Romano Schmid", ovr: 78 },
      { name: "Marvin Ducksch", ovr: 77 },
      { name: "Niclas Füllkrug", ovr: 79 },
      { name: "Justin Njinmah", ovr: 78 },
    ]
  },
  "VfL Wolfsburg": {
    manager: "Niko Kovač",
    players: [
      { name: "Koen Casteels", ovr: 85 },
      { name: "Jerome Roussillon", ovr: 85 },
      { name: "Maxence Lacroix", ovr: 84 },
      { name: "Ridle Baku", ovr: 83 },
      { name: "Joakim Maehle", ovr: 80 },
      { name: "Maximilian Arnold", ovr: 80 },
      { name: "Patrick Wimmer", ovr: 78 },
      { name: "Mattias Svanberg", ovr: 78 },
      { name: "Jonas Wind", ovr: 78 },
      { name: "Lukas Nmecha", ovr: 78 },
      { name: "Yannick Gerhardt", ovr: 77 },
    ]
  },
  "Arminia Bielefeld": {
    manager: "Uwe Koschinat",
    players: [
      { name: "Martin Fraisl", ovr: 84 },
      { name: "Fabian Klos", ovr: 83 },
      { name: "Bryan Lasme", ovr: 85 },
    ]
  },
  "Darmstadt 98": {
    manager: "Torsten Lieberknecht",
    players: [
      { name: "Marcel Schuhen", ovr: 86 },
      { name: "Fabian Nürnberger", ovr: 86 },
      { name: "Luca Pfeiffer", ovr: 85 },
    ]
  },
  "Fortuna Düsseldorf": {
    manager: "Daniel Thioune",
    players: [
      { name: "Florian Kastenmeier", ovr: 84 },
      { name: "Matthias Zimmermann", ovr: 86 },
      { name: "Dawid Kownacki", ovr: 84 },
    ]
  },
  "Greuther Fürth": {
    manager: "Alexander Zorniger",
    players: [
      { name: "Andreas Linde", ovr: 85 },
      { name: "Damian Michalski", ovr: 86 },
      { name: "Branimir Hrgota", ovr: 83 },
    ]
  },
  "Hannover 96": {
    manager: "Stefan Leitl",
    players: [
      { name: "Ron-Robert Zieler", ovr: 85 },
      { name: "Bright Arrey-Mbi", ovr: 83 },
      { name: "Nicolo Tresoldi", ovr: 83 },
    ]
  },
  "Holstein Kiel": {
    manager: "Marcel Rapp",
    players: [
      { name: "Thomas Dähne", ovr: 86 },
      { name: "Marco Komenda", ovr: 83 },
      { name: "Steven Skrzybski", ovr: 85 },
    ]
  },
  "Jahn Regensburg": {
    manager: "Joe Enochs",
    players: [
      { name: "Alexander Meyer", ovr: 83 },
      { name: "Max Besuschkow", ovr: 82 },
      { name: "Andreas Albers", ovr: 84 },
    ]
  },
  "Kaiserslautern": {
    manager: "Friedhelm Funkel",
    players: [
      { name: "Andreas Luthe", ovr: 86 },
      { name: "Kevin Kraus", ovr: 82 },
      { name: "Terrence Boyd", ovr: 84 },
    ]
  },
  "Karlsruher SC": {
    manager: "Christian Eichner",
    players: [
      { name: "Marius Gersbeck", ovr: 86 },
      { name: "David Pisot", ovr: 84 },
      { name: "Malik Batmaz", ovr: 83 },
    ]
  },
  "Magdeburg": {
    manager: "Christian Titz",
    players: [
      { name: "Dominik Reimann", ovr: 83 },
      { name: "Anthony Roczen", ovr: 84 },
      { name: "Baris Atik", ovr: 82 },
    ]
  },
  "Nuremberg": {
    manager: "Miroslav Klose",
    players: [
      { name: "Christian Mathenia", ovr: 86 },
      { name: "Lino Tempelmann", ovr: 84 },
      { name: "Christoph Daferner", ovr: 82 },
    ]
  },
  "Paderborn": {
    manager: "Lukas Kwasniok",
    players: [
      { name: "Jannik Huth", ovr: 83 },
      { name: "Ron Schallenberg", ovr: 84 },
      { name: "Jannis Heuer", ovr: 81 },
    ]
  },
  "Preußen Münster": {
    manager: "Sascha Hildmann",
    players: [
      { name: "Dominik Reimann", ovr: 85 },
      { name: "Henok Teklab", ovr: 85 },
      { name: "Lukas Frenkert", ovr: 82 },
    ]
  },
  "Schalke 04": {
    manager: "Karel Geraerts",
    players: [
      { name: "Justin Heekeren", ovr: 86 },
      { name: "Keke Topp", ovr: 83 },
      { name: "Marius Bülter", ovr: 83 },
    ]
  },
  "Eintracht Braunschweig": {
    manager: "Daniel Scherning",
    players: [
      { name: "Jasmin Fejzic", ovr: 83 },
      { name: "Ermin Bicakcic", ovr: 84 },
      { name: "Saulo Decarli", ovr: 83 },
    ]
  },
  "VfL Bochum": {
    manager: "Thomas Letsch",
    players: [
      { name: "Manuel Riemann", ovr: 84 },
      { name: "Keven Schlotterbeck", ovr: 82 },
      { name: "Philipp Hofmann", ovr: 83 },
    ]
  },
  "Atalanta": {
    manager: "Gian Piero Gasperini",
    players: [
      { name: "Juan Musso", ovr: 84 },
      { name: "Rafael Tolói", ovr: 82 },
      { name: "Merih Demiral", ovr: 83 },
      { name: "Berat Djimsiti", ovr: 80 },
      { name: "Davide Zappacosta", ovr: 81 },
      { name: "Marten de Roon", ovr: 82 },
      { name: "Mario Pasalic", ovr: 81 },
      { name: "Ademola Lookman", ovr: 78 },
      { name: "Gianluca Scamacca", ovr: 78 },
      { name: "Teun Koopmeiners", ovr: 77 },
      { name: "Charles De Ketelaere", ovr: 77 },
      { name: "Joakim Maehle", ovr: 75 },
      { name: "El Bilal Touré", ovr: 76 },
    ]
  },
  "Bologna": {
    manager: "Thiago Motta",
    players: [
      { name: "Lukasz Skorupski", ovr: 84 },
      { name: "Lorenzo De Silvestri", ovr: 83 },
      { name: "Charalampos Lykogiannis", ovr: 83 },
      { name: "Kevin Bonifazi", ovr: 81 },
      { name: "Riccardo Calafiori", ovr: 81 },
      { name: "Nicolas Dominguez", ovr: 81 },
      { name: "Lewis Ferguson", ovr: 81 },
      { name: "Marko Arnautovic", ovr: 79 },
      { name: "Musa Barrow", ovr: 79 },
      { name: "Remo Freuler", ovr: 77 },
      { name: "Riccardo Orsolini", ovr: 78 },
      { name: "Michel Aebischer", ovr: 75 },
    ]
  },
  "Cagliari": {
    manager: "Claudio Ranieri",
    players: [
      { name: "Boris Radunovic", ovr: 85 },
      { name: "Zito Luvumbo", ovr: 85 },
      { name: "Gianluca Lapadula", ovr: 82 },
      { name: "Davide Astori", ovr: 81 },
      { name: "Fabio Liverani", ovr: 80 },
    ]
  },
  "Como": {
    manager: "Cesc Fàbregas",
    players: [
      { name: "Alberto Gennari", ovr: 84 },
      { name: "Nico Paz", ovr: 82 },
      { name: "Assane Diao", ovr: 84 },
      { name: "Patrick Cutrone", ovr: 83 },
    ]
  },
  "Cremonese": {
    manager: "David Nicola",
    players: [
      { name: "Ionut Radu", ovr: 85 },
      { name: "Enrico Del Prato", ovr: 84 },
      { name: "Michele Castagnetti", ovr: 81 },
      { name: "Daniel Ciofani", ovr: 82 },
      { name: "Felix Afena-Gyan", ovr: 82 },
    ]
  },
  "Fiorentina": {
    manager: "Raffaele Palladino",
    players: [
      { name: "Pietro Terracciano", ovr: 85 },
      { name: "Dodo", ovr: 82 },
      { name: "Lucas Quarta", ovr: 83 },
      { name: "Nikola Milenkovic", ovr: 81 },
      { name: "Cristiano Biraghi", ovr: 83 },
      { name: "Sofyan Amrabat", ovr: 79 },
      { name: "Gaetano Castrovilli", ovr: 80 },
      { name: "Nicolas Gonzalez", ovr: 80 },
      { name: "Christian Kouamé", ovr: 76 },
      { name: "Luca Jovic", ovr: 77 },
      { name: "Jonathan Ikoné", ovr: 75 },
      { name: "Giacomo Bonaventura", ovr: 75 },
      { name: "Arthur", ovr: 76 },
    ]
  },
  "Genoa": {
    manager: "Alberto Gilardino",
    players: [
      { name: "Joseph Okonkwo", ovr: 84 },
      { name: "Stefano Sabelli", ovr: 84 },
      { name: "Radu Dragusin", ovr: 82 },
      { name: "Johan Vásquez", ovr: 82 },
      { name: "Aaron Martin", ovr: 79 },
      { name: "Morten Frendrup", ovr: 82 },
      { name: "Badelj Milan", ovr: 80 },
      { name: "Caleb Ekuban", ovr: 80 },
      { name: "Albert Guðmundsson", ovr: 77 },
      { name: "Mateo Retegui", ovr: 79 },
      { name: "Junior Messias", ovr: 77 },
    ]
  },
  "Hellas Verona": {
    manager: "Marco Baroni",
    players: [
      { name: "Montipò Lorenzo", ovr: 84 },
      { name: "Faraoni Davide", ovr: 84 },
      { name: "Magnani Giangiacomo", ovr: 83 },
      { name: "Hien Isak", ovr: 81 },
      { name: "Lazovic Darko", ovr: 82 },
      { name: "Tameze Adrien", ovr: 81 },
      { name: "Serdar Domagoj", ovr: 79 },
      { name: "Ngonge Cyril", ovr: 77 },
      { name: "Noslin Tijjani", ovr: 79 },
      { name: "Djuric Milan", ovr: 76 },
    ]
  },
  "Inter Milan": {
    manager: "Simone Inzaghi",
    players: [
      { name: "Yann Sommer", ovr: 93 },
      { name: "Matteo Darmian", ovr: 92 },
      { name: "Francesco Acerbi", ovr: 90 },
      { name: "Stefan de Vrij", ovr: 89 },
      { name: "Federico Dimarco", ovr: 88 },
      { name: "Nicolò Barella", ovr: 89 },
      { name: "Kristjan Asllani", ovr: 88 },
      { name: "Hakan Çalhanoğlu", ovr: 86 },
      { name: "Lautaro Martínez", ovr: 86 },
      { name: "Marcus Thuram", ovr: 87 },
      { name: "Denzel Dumfries", ovr: 87 },
      { name: "Alexis Sánchez", ovr: 87 },
      { name: "Henrikh Mkhitaryan", ovr: 83 },
      { name: "Marko Arnautovic", ovr: 85 },
    ]
  },
  "Juventus": {
    manager: "Massimiliano Allegri",
    players: [
      { name: "Wojciech Szczęsny", ovr: 88 },
      { name: "Danilo", ovr: 91 },
      { name: "Federico Gatti", ovr: 87 },
      { name: "Gleison Bremer", ovr: 89 },
      { name: "Alex Sandro", ovr: 87 },
      { name: "Manuel Locatelli", ovr: 88 },
      { name: "Adrien Rabiot", ovr: 85 },
      { name: "Weston McKennie", ovr: 87 },
      { name: "Federico Chiesa", ovr: 85 },
      { name: "Dušan Vlahović", ovr: 85 },
      { name: "Kenan Yıldız", ovr: 83 },
      { name: "Timothy Weah", ovr: 82 },
      { name: "Arkadiusz Milik", ovr: 81 },
    ]
  },
  "Lazio": {
    manager: "Maurizio Sarri",
    players: [
      { name: "Ivan Provedel", ovr: 86 },
      { name: "Adam Marusic", ovr: 84 },
      { name: "Alessio Romagnoli", ovr: 84 },
      { name: "Mario Gila", ovr: 83 },
      { name: "Nicolo Casale", ovr: 83 },
      { name: "Luis Alberto", ovr: 80 },
      { name: "Sergej Milinković-Savić", ovr: 79 },
      { name: "Mattia Zaccagni", ovr: 80 },
      { name: "Ciro Immobile", ovr: 79 },
      { name: "Felipe Anderson", ovr: 78 },
      { name: "Taty Castellanos", ovr: 75 },
      { name: "Matias Vecino", ovr: 77 },
    ]
  },
  "Lecce": {
    manager: "Roberto D'Aversa",
    players: [
      { name: "Wladimiro Falcone", ovr: 84 },
      { name: "Lameck Banda", ovr: 85 },
      { name: "Valentin Gendrey", ovr: 82 },
      { name: "Freddi Dragusin", ovr: 81 },
      { name: "Fabian Ruiz", ovr: 83 },
      { name: "Remi Oudin", ovr: 82 },
    ]
  },
  "AC Milan": {
    manager: "Stefano Pioli",
    players: [
      { name: "Mike Maignan", ovr: 91 },
      { name: "Davide Calabria", ovr: 89 },
      { name: "Malick Thiaw", ovr: 90 },
      { name: "Fikayo Tomori", ovr: 86 },
      { name: "Theo Hernández", ovr: 89 },
      { name: "Tijjani Reijnders", ovr: 86 },
      { name: "Ismael Bennacer", ovr: 87 },
      { name: "Ruben Loftus-Cheek", ovr: 87 },
      { name: "Christian Pulisic", ovr: 86 },
      { name: "Olivier Giroud", ovr: 83 },
      { name: "Rafael Leão", ovr: 86 },
      { name: "Yunus Musah", ovr: 82 },
      { name: "Luka Jović", ovr: 82 },
      { name: "Noah Okafor", ovr: 81 },
    ]
  },
  "Napoli": {
    manager: "Antonio Conte",
    players: [
      { name: "Alex Meret", ovr: 85 },
      { name: "Giovanni Di Lorenzo", ovr: 82 },
      { name: "Amir Rrahmani", ovr: 83 },
      { name: "Juan Jesus", ovr: 81 },
      { name: "Mathias Olivera", ovr: 81 },
      { name: "Piotr Zieliński", ovr: 82 },
      { name: "Diego Demme", ovr: 80 },
      { name: "Hirving Lozano", ovr: 77 },
      { name: "Khvicha Kvaratskhelia", ovr: 79 },
      { name: "Victor Osimhen", ovr: 79 },
      { name: "Giovanni Simeone", ovr: 76 },
      { name: "André-Frank Zambo Anguissa", ovr: 77 },
      { name: "Giacomo Raspadori", ovr: 74 },
    ]
  },
  "Parma": {
    manager: "Fabio Pecchia",
    players: [
      { name: "Zion Suzuki", ovr: 83 },
      { name: "Woyo Coulibaly", ovr: 82 },
      { name: "Casasola Luca", ovr: 83 },
      { name: "Valenti Simon", ovr: 81 },
      { name: "Pontus Almqvist", ovr: 83 },
      { name: "Man Ange Sébastien Ondoua", ovr: 79 },
      { name: "Dennis Man", ovr: 81 },
    ]
  },
  "Pisa": {
    manager: "Alberto Aquilani",
    players: [
      { name: "Nicolas Andrade", ovr: 86 },
      { name: "Luca Caracciolo", ovr: 82 },
      { name: "Tommaso Baldanzeddu", ovr: 83 },
      { name: "Luca D'Andrea", ovr: 83 },
      { name: "Joshua Matos", ovr: 82 },
    ]
  },
  "Roma": {
    manager: "Daniele De Rossi",
    players: [
      { name: "Mile Svilar", ovr: 86 },
      { name: "Rick Karsdorp", ovr: 82 },
      { name: "Gianluca Mancini", ovr: 83 },
      { name: "Evan Ndicka", ovr: 83 },
      { name: "Leonardo Spinazzola", ovr: 82 },
      { name: "Bryan Cristante", ovr: 79 },
      { name: "Leandro Paredes", ovr: 81 },
      { name: "Lorenzo Pellegrini", ovr: 77 },
      { name: "Paulo Dybala", ovr: 79 },
      { name: "Romelu Lukaku", ovr: 76 },
      { name: "Stephan El Shaarawy", ovr: 75 },
      { name: "Houssem Aouar", ovr: 77 },
    ]
  },
  "Sassuolo": {
    manager: "Alessio Dionisi",
    players: [
      { name: "Andrea Consigli", ovr: 83 },
      { name: "Marlon", ovr: 83 },
      { name: "Kaan Ayhan", ovr: 83 },
      { name: "Rogerio", ovr: 83 },
      { name: "Maxime Lopez", ovr: 81 },
      { name: "Luca Moro", ovr: 81 },
      { name: "Domenico Berardi", ovr: 80 },
    ]
  },
  "Torino": {
    manager: "Paolo Vanoli",
    players: [
      { name: "Vanja Milinković-Savić", ovr: 85 },
      { name: "Raoul Bellanova", ovr: 85 },
      { name: "Alessandro Buongiorno", ovr: 84 },
      { name: "Ricardo Rodríguez", ovr: 82 },
      { name: "Samuele Ricci", ovr: 81 },
      { name: "Rolando Mandragora", ovr: 82 },
      { name: "Nikola Vlašić", ovr: 78 },
      { name: "Valentino Lazaro", ovr: 81 },
      { name: "Antonio Sanabria", ovr: 80 },
    ]
  },
  "Udinese": {
    manager: "Gabriele Cioffi",
    players: [
      { name: "Marco Silvestri", ovr: 83 },
      { name: "Rodrigo Becao", ovr: 85 },
      { name: "Jaka Bijol", ovr: 81 },
      { name: "Adam Masina", ovr: 80 },
      { name: "Walace", ovr: 81 },
      { name: "Jean-Victor Makengo", ovr: 82 },
      { name: "Isaac Success", ovr: 79 },
      { name: "Roberto Pereyra", ovr: 78 },
      { name: "Beto", ovr: 78 },
      { name: "Tolgay Arslan", ovr: 76 },
    ]
  },
  "Reggiana": {
    manager: "Alessandro Nesta",
    players: [
      { name: "Lucchetti Marco", ovr: 83 },
      { name: "Portanova Manolo", ovr: 85 },
    ]
  },
  "Frosinone": {
    manager: "Eusebio Di Francesco",
    players: [
      { name: "Turati Stefano", ovr: 83 },
      { name: "Monterisi Federico", ovr: 84 },
      { name: "Mazzitelli Luca", ovr: 82 },
    ]
  },
  "Palermo": {
    manager: "Eugenio Corini",
    players: [
      { name: "Pigliacelli Silvano", ovr: 86 },
      { name: "Graves Charlie", ovr: 84 },
      { name: "Brunori Matteo", ovr: 82 },
    ]
  },
  "Venezia": {
    manager: "Paolo Vanoli",
    players: [
      { name: "Stankovic Filip", ovr: 83 },
      { name: "Zampano Luigi", ovr: 84 },
      { name: "Busio Gianluca", ovr: 83 },
    ]
  },
  "Sampdoria": {
    manager: "Andrea Pirlo",
    players: [
      { name: "Emil Audero", ovr: 83 },
      { name: "Fabio Depaoli", ovr: 85 },
      { name: "Manolo Gabbiadini", ovr: 82 },
    ]
  },
  "Spezia": {
    manager: "Luca D'Angelo",
    players: [
      { name: "Dragowski Bartlomiej", ovr: 85 },
      { name: "Hristov Nikolay", ovr: 86 },
      { name: "Esposito Sebastiano", ovr: 83 },
    ]
  },
  "Modena": {
    manager: "Paolo Bianco",
    players: [
      { name: "Gagno Davide", ovr: 83 },
      { name: "Fili Filippo", ovr: 82 },
      { name: "Manconi Luca", ovr: 81 },
    ]
  },
  "Bari": {
    manager: "Pasquale Marino",
    players: [
      { name: "Brenno Gabriel", ovr: 86 },
      { name: "Di Cesare Vito", ovr: 83 },
      { name: "Scheidler Zan", ovr: 83 },
    ]
  },
  "Catanzaro": {
    manager: "Vincenzo Vivarini",
    players: [
      { name: "Fulignati Stefano", ovr: 83 },
      { name: "Scognamillo Nicolò", ovr: 85 },
      { name: "Iemmello Pietro", ovr: 83 },
    ]
  },
  "Cittadella": {
    manager: "Edoardo Gorini",
    players: [
      { name: "Kastrati Simone", ovr: 86 },
      { name: "Pavan Alessandro", ovr: 85 },
      { name: "Tounkara Lamine", ovr: 83 },
    ]
  },
  "Lecco": {
    manager: "Luciano Foschi",
    players: [
      { name: "Abbishkene Damian", ovr: 85 },
      { name: "Caporale Davide", ovr: 82 },
      { name: "Ligonnet Luca", ovr: 84 },
    ]
  },
  "FeralpiSalò": {
    manager: "Marco Zaffaroni",
    players: [
      { name: "Pizzignacco Elia", ovr: 86 },
      { name: "Balestrero Lorenzo", ovr: 84 },
      { name: "Di Molfetta Filippo", ovr: 82 },
    ]
  },
  "Brescia": {
    manager: "Rolando Maran",
    players: [
      { name: "Andrenacci Filippo", ovr: 84 },
      { name: "Mangraviti Matteo", ovr: 83 },
      { name: "Ayé Florian", ovr: 81 },
    ]
  },
  "Cosenza": {
    manager: "Fabio Caserta",
    players: [
      { name: "Marson Michal", ovr: 84 },
      { name: "Fontanarosa Mattia", ovr: 85 },
      { name: "Mazzocchi Iacopo", ovr: 83 },
    ]
  },
  "Sudtirol": {
    manager: "Pierpaolo Bisoli",
    players: [
      { name: "Poluzzi Davide", ovr: 86 },
      { name: "El Kaouakibi Sofian", ovr: 85 },
      { name: "Lunetta Lucas", ovr: 81 },
    ]
  },
  "Ternana": {
    manager: "Roberto Breda",
    players: [
      { name: "Iannarilli Jacopo", ovr: 84 },
      { name: "Corradini Damiano", ovr: 82 },
      { name: "Raimondo Simone", ovr: 81 },
    ]
  },
  "Angers": {
    manager: "Alexandre Dujeux",
    players: [
      { name: "Paul Bernardoni", ovr: 85 },
      { name: "Enzio Guessand", ovr: 84 },
      { name: "Adil Rami", ovr: 83 },
      { name: "Himad Abdelli", ovr: 81 },
      { name: "Mohamed Bayo", ovr: 79 },
    ]
  },
  "Auxerre": {
    manager: "Christophe Pélissier",
    players: [
      { name: "Donovan Léon", ovr: 83 },
      { name: "Christopher Jullien", ovr: 83 },
      { name: "Nuno Mendes", ovr: 83 },
      { name: "Rémy Dugimont", ovr: 81 },
      { name: "Théo Pellenard", ovr: 80 },
    ]
  },
  "Brest": {
    manager: "Eric Roy",
    players: [
      { name: "Marco Bizot", ovr: 86 },
      { name: "Lilian Brassier", ovr: 83 },
      { name: "Pierre Lees-Melou", ovr: 81 },
      { name: "Romain Del Castillo", ovr: 82 },
      { name: "Mounié Steve", ovr: 82 },
    ]
  },
  "Le Havre": {
    manager: "Luka Elsner",
    players: [
      { name: "Arthur Desmas", ovr: 84 },
      { name: "Yoann Salmier", ovr: 85 },
      { name: "Emmanuel Sabbi", ovr: 84 },
      { name: "André Ayew", ovr: 80 },
      { name: "Arouna Sangante", ovr: 82 },
    ]
  },
  "Lens": {
    manager: "Franck Haise",
    players: [
      { name: "Brice Samba", ovr: 83 },
      { name: "Jonathan Gradit", ovr: 83 },
      { name: "Kevin Danso", ovr: 82 },
      { name: "Deiver Machado", ovr: 81 },
      { name: "Salis Abdul Samed", ovr: 82 },
      { name: "Adrien Thomasson", ovr: 80 },
      { name: "Florian Sotoca", ovr: 80 },
      { name: "Wesley Said", ovr: 80 },
      { name: "Loïs Openda", ovr: 79 },
      { name: "David Pereira Da Costa", ovr: 77 },
    ]
  },
  "Lille": {
    manager: "Paulo Fonseca",
    players: [
      { name: "Lucas Chevalier", ovr: 85 },
      { name: "Tiago Djaló", ovr: 83 },
      { name: "Alexsandro", ovr: 85 },
      { name: "Bafodé Diakité", ovr: 81 },
      { name: "Reinildo Mandava", ovr: 81 },
      { name: "Benjamin André", ovr: 80 },
      { name: "Xeka", ovr: 80 },
      { name: "Angel Gomes", ovr: 78 },
      { name: "Tiago Santos", ovr: 78 },
      { name: "Jonathan David", ovr: 78 },
      { name: "Rémy Cabella", ovr: 75 },
      { name: "Adam Ounas", ovr: 74 },
    ]
  },
  "Lorient": {
    manager: "Régis Le Bris",
    players: [
      { name: "Yohann Thuram-Ulien", ovr: 86 },
      { name: "Julien Laporte", ovr: 83 },
      { name: "Stéphane Diarra", ovr: 83 },
      { name: "Enzo Le Fée", ovr: 83 },
      { name: "Armand Laurienté", ovr: 82 },
    ]
  },
  "Lyon": {
    manager: "Pierre Sage",
    players: [
      { name: "Lucas Perri", ovr: 84 },
      { name: "Saël Kumbedi", ovr: 84 },
      { name: "Jake O'Brien", ovr: 82 },
      { name: "Nicolas Tagliafico", ovr: 81 },
      { name: "Corentin Tolisso", ovr: 82 },
      { name: "Romain Faivre", ovr: 81 },
      { name: "Alexandre Lacazette", ovr: 81 },
      { name: "Mika Biereth", ovr: 79 },
      { name: "Ainsley Maitland-Niles", ovr: 78 },
      { name: "Malick Fofana", ovr: 79 },
      { name: "Duje Caleta-Car", ovr: 74 },
      { name: "Wilfried Zaha", ovr: 74 },
    ]
  },
  "Marseille": {
    manager: "Jean-Louis Gasset",
    players: [
      { name: "Pau López", ovr: 85 },
      { name: "Jonathan Clauss", ovr: 82 },
      { name: "Samuel Gigot", ovr: 84 },
      { name: "Leonardo Balerdi", ovr: 80 },
      { name: "Nuno Tavares", ovr: 83 },
      { name: "Jordan Veretout", ovr: 82 },
      { name: "Valentin Rongier", ovr: 79 },
      { name: "Mason Greenwood", ovr: 80 },
      { name: "Amine Harit", ovr: 79 },
      { name: "Vitinha", ovr: 75 },
      { name: "Azzedine Ounahi", ovr: 76 },
      { name: "Chancel Mbemba", ovr: 76 },
      { name: "Pape Gueye", ovr: 75 },
    ]
  },
  "Metz": {
    manager: "László Bölöni",
    players: [
      { name: "Alexandre Oukidja", ovr: 86 },
      { name: "Christian Sanou", ovr: 84 },
      { name: "Matthieu Udol", ovr: 81 },
      { name: "Delvin N'Dinga", ovr: 82 },
      { name: "Georges Mikautadze", ovr: 80 },
    ]
  },
  "Monaco": {
    manager: "Adi Hütter",
    players: [
      { name: "Philipp Köhn", ovr: 84 },
      { name: "Vanderson", ovr: 83 },
      { name: "Axel Disasi", ovr: 85 },
      { name: "Mohamed Camara", ovr: 80 },
      { name: "Takumi Minamino", ovr: 82 },
      { name: "Wissam Ben Yedder", ovr: 81 },
      { name: "Breel Embolo", ovr: 81 },
      { name: "Ansu Fati", ovr: 80 },
      { name: "Paul Pogba", ovr: 76 },
      { name: "Fariès Hassen", ovr: 78 },
    ]
  },
  "Nantes": {
    manager: "Jocelyn Gourvennec",
    players: [
      { name: "Alban Lafont", ovr: 86 },
      { name: "Moussa Sissoko", ovr: 85 },
      { name: "Nicolas Pallois", ovr: 85 },
      { name: "Marcus Coco", ovr: 84 },
      { name: "Mostafa Mohamed", ovr: 81 },
    ]
  },
  "Nice": {
    manager: "Francesco Farioli",
    players: [
      { name: "Marcin Bułka", ovr: 84 },
      { name: "Dante", ovr: 84 },
      { name: "Jean-Clair Todibo", ovr: 82 },
      { name: "Khéphren Thuram", ovr: 82 },
      { name: "Evann Guessand", ovr: 79 },
      { name: "Terem Moffi", ovr: 82 },
      { name: "Sofiane Diop", ovr: 80 },
    ]
  },
  "Paris FC": {
    manager: "Stéphane Gilli",
    players: [
      { name: "Benjamin Lecomte", ovr: 85 },
      { name: "Sada Thioub", ovr: 82 },
      { name: "Massimo Bernauer", ovr: 81 },
      { name: "Lionel Carole", ovr: 82 },
      { name: "Ilan Kebbal", ovr: 82 },
    ]
  },
  "Paris Saint-Germain": {
    manager: "Luis Enrique",
    players: [
      { name: "Gianluigi Donnarumma", ovr: 94 },
      { name: "Achraf Hakimi", ovr: 92 },
      { name: "Marquinhos", ovr: 91 },
      { name: "Milan Škriniar", ovr: 89 },
      { name: "Lucas Hernández", ovr: 90 },
      { name: "Vitinha", ovr: 89 },
      { name: "Warren Zaïre-Emery", ovr: 90 },
      { name: "Fabián Ruiz", ovr: 87 },
      { name: "Ousmane Dembélé", ovr: 87 },
      { name: "Bradley Barcola", ovr: 87 },
      { name: "Gonçalo Ramos", ovr: 86 },
      { name: "Randal Kolo Muani", ovr: 83 },
      { name: "João Neves", ovr: 85 },
    ]
  },
  "Rennes": {
    manager: "Julen Stéphan",
    players: [
      { name: "Dogan Alemdar", ovr: 85 },
      { name: "Hamari Traoré", ovr: 84 },
      { name: "Adrien Truffert", ovr: 84 },
      { name: "Lovro Majer", ovr: 81 },
      { name: "Amine Gouiri", ovr: 81 },
      { name: "Arnaud Kalimuendo", ovr: 78 },
      { name: "Martin Terrier", ovr: 78 },
      { name: "Jeanuël Belocian", ovr: 78 },
    ]
  },
  "Strasbourg": {
    manager: "Patrick Vieira",
    players: [
      { name: "Matz Sels", ovr: 84 },
      { name: "Shahinez Abdellaoui", ovr: 85 },
      { name: "Gerzino Nyamsi", ovr: 82 },
      { name: "Lenny Lacroix", ovr: 81 },
      { name: "Dilane Bakwa", ovr: 81 },
      { name: "Maxime Le Marchand", ovr: 81 },
      { name: "Habib Diallo", ovr: 79 },
      { name: "Joaquín Panichelli", ovr: 79 },
    ]
  },
  "Toulouse": {
    manager: "Carles Martínez Novell",
    players: [
      { name: "Guillaume Restes", ovr: 85 },
      { name: "Mikkel Desler", ovr: 83 },
      { name: "Anthony Rouault", ovr: 82 },
      { name: "Rasmus Nicolaisen", ovr: 80 },
      { name: "Moussa Diarra", ovr: 83 },
      { name: "Stijn Spierings", ovr: 78 },
      { name: "Branco van den Boomen", ovr: 79 },
      { name: "Zakaria Aboukhlal", ovr: 80 },
      { name: "Thijs Dallinga", ovr: 77 },
      { name: "Saulus Utkus", ovr: 78 },
    ]
  },
  "Guingamp": {
    manager: "Stéphane Dumont",
    players: [
      { name: "Jonas Omlin", ovr: 84 },
      { name: "Benjamin Moukandjo", ovr: 83 },
      { name: "Alexandre Mendy", ovr: 85 },
    ]
  },
  "Troyes": {
    manager: "David Guion",
    players: [
      { name: "Gauthier Gallon", ovr: 83 },
      { name: "Nuno Da Costa", ovr: 84 },
      { name: "Renaud Ripart", ovr: 84 },
    ]
  },
  "Caen": {
    manager: "Nicolas Seube",
    players: [
      { name: "Gauthier Gallon", ovr: 86 },
      { name: "Malik Tchokounté", ovr: 85 },
      { name: "Mickaël Alphonse", ovr: 82 },
    ]
  },
  "Quevilly-Rouen": {
    manager: "Olivier Frapolli",
    players: [
      { name: "Geoffrey Jourdren", ovr: 85 },
      { name: "Romain Campoy", ovr: 85 },
    ]
  },
  "Grenoble Foot": {
    manager: "Vincent Hognon",
    players: [
      { name: "Gauthier Gallon", ovr: 83 },
      { name: "Pape Gueye", ovr: 83 },
      { name: "Bilel Ghazi", ovr: 84 },
    ]
  },
  "Valenciennes": {
    manager: "Ahmed Kantari",
    players: [
      { name: "Yohann Thuram", ovr: 86 },
      { name: "Hamidou Traoré", ovr: 83 },
      { name: "Paul Ayong", ovr: 82 },
    ]
  },
  "Rodez": {
    manager: "Didier Santini",
    players: [
      { name: "Harouna Sy", ovr: 83 },
      { name: "Dorian Balmont", ovr: 83 },
    ]
  },
  "Pau FC": {
    manager: "Nicolas Usaï",
    players: [
      { name: "Kevin Leborgne", ovr: 84 },
      { name: "Giani Dali", ovr: 85 },
    ]
  },
  "Dijon": {
    manager: "Benoît Tavenot",
    players: [
      { name: "Anthony Racioppi", ovr: 83 },
      { name: "Fouad Chafik", ovr: 83 },
      { name: "Charis Lykourgos", ovr: 83 },
    ]
  },
  "Bordeaux": {
    manager: "Albert Riera",
    players: [
      { name: "Gauthier Gallon", ovr: 85 },
      { name: "Mehdi Zerkane", ovr: 83 },
      { name: "Josh Wilson-Esbrand", ovr: 81 },
    ]
  },
  "Annecy": {
    manager: "Laurent Guyot",
    players: [
      { name: "Lucas Margueron", ovr: 84 },
      { name: "Sébastien Biancheri", ovr: 83 },
    ]
  },
  "Laval": {
    manager: "Olivier Frapolli",
    players: [
      { name: "Laurent Crochet", ovr: 86 },
      { name: "Joffrey Cuffaut", ovr: 86 },
    ]
  },
  "Saint-Étienne": {
    manager: "Laurent Batlles",
    players: [
    ]
  },
  "Montpellier": {
    manager: "Michel Der Zakarian",
    players: [
    ]
  },
  "Reims": {
    manager: "Will Still",
    players: [
    ]
  },
};

export function getClubSquad(clubName: string): ClubSquad {
  const normalized = Object.keys(SHEET_SQUADS).find(k => k.toLowerCase() === clubName.toLowerCase());
  if (normalized && SHEET_SQUADS[normalized]) {
    return SHEET_SQUADS[normalized];
  }

  // Safe fallback if not found in dictionary
  return {
    manager: "Gaffer",
    players: [
      { name: "Tom Maddison", ovr: 78 },
      { name: "Mason Saka", ovr: 81 },
      { name: "Harry Kane", ovr: 89 },
      { name: "Luke Shaw", ovr: 80 },
      { name: "John Stones", ovr: 84 },
      { name: "Kalvin Walker", ovr: 76 },
      { name: "Marcus Rashford", ovr: 82 },
      { name: "Jordan Pickford", ovr: 83 },
      { name: "Conor Gallagher", ovr: 79 },
      { name: "Jack Grealish", ovr: 84 },
      { name: "Kieran Trippier", ovr: 82 },
      { name: "Kyle Walker", ovr: 85 }
    ]
  };
}
