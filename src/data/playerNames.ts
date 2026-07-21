/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const NATIONALITY_NAMES: Record<string, { first: string[]; last: string[]; isStyle?: string }> = {
  England: {
    first: [
      'Jack', 'George', 'Charlie', 'Thomas', 'William', 'James', 'Oliver', 'Henry', 'Edward', 'Arthur',
      'Alfie', 'Freddie', 'Samuel', 'Daniel', 'Matthew', 'Luke', 'Benjamin', 'Nathan', 'Callum', 'Liam',
      'Owen', 'Kieran', 'Ryan', 'Declan', 'Connor', 'Jamie', 'Scott', 'Lewis', 'Ellis', 'Rhys',
      'Cian', 'Finley', 'Harvey', 'Archie', 'Stanley', 'Albert', 'Ernest', 'Reg', 'Monty', 'Alistair',
      'Nigel', 'Clive', 'Derek', 'Kenneth', 'Raymond', 'Geoffrey', 'Colin', 'Malcolm', 'Trevor', 'Barry',
      'Terry'
    ],
    last: [
      'Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts',
      'Johnson', 'White', 'Walker', 'Hall', 'Clarke', 'Wood', 'Harris', 'Martin', 'Thompson', 'Moore',
      'Cooper', 'Ward', 'Morris', 'Harrison', 'Turner', 'Green', 'Baker', 'Carter', 'Phillips', 'Mitchell',
      'Barker', 'Lawson', 'Stead', 'Holt', 'Birch', 'Frost', 'Gale', 'Hewitt', 'Pearce', 'Marsh',
      'Hicks', 'Lowe', 'Cross', 'Tanner', 'Butcher', 'Slater', 'Potts', 'Stubbs', 'Rowley', 'Naylor'
    ]
  },
  Spain: {
    first: [
      'Alejandro', 'Carlos', 'Miguel', 'Antonio', 'Pablo', 'Diego', 'Sergio', 'Marcos', 'Adrián', 'Álvaro',
      'David', 'Javier', 'Gonzalo', 'Víctor', 'Eduardo', 'Rubén', 'Óscar', 'Raúl', 'Fernando', 'Borja',
      'Iñigo', 'Unai', 'Iker', 'Mikel', 'Asier', 'Gaizka', 'Xabier', 'Andoni', 'Julen', 'Aitor',
      'Beñat', 'Gorka', 'Jon', 'Aritz', 'Ander', 'Eneko', 'Kepa', 'Oier', 'Dani', 'Salva',
      'Toni', 'Santi', 'Nacho', 'Cesc', 'Deco', 'Oriol', 'Sergi', 'Roger', 'Marc', 'Gerard'
    ],
    last: [
      'García', 'Martínez', 'López', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'Pérez', 'Gómez', 'Moreno',
      'Muñoz', 'Romero', 'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Molina', 'Álvarez', 'Gutiérrez',
      'Herrera', 'Ortega', 'Castro', 'Jiménez', 'Ruiz', 'Pardo', 'Llorente', 'Cabrera', 'Ibáñez', 'Serrano',
      'Prieto', 'Aguilar', 'Fuentes', 'Rubio', 'Méndez', 'Guerrero', 'Medina', 'Castillo', 'Vidal', 'Reyes',
      'Mora', 'Bravo', 'Iglesias', 'Sala', 'Pont', 'Mas', 'Puig', 'Vila', 'Soler', 'Ferrer'
    ]
  },
  Italy: {
    first: [
      'Matteo', 'Lorenzo', 'Luca', 'Marco', 'Alessandro', 'Andrea', 'Davide', 'Simone', 'Riccardo', 'Filippo',
      'Giovanni', 'Roberto', 'Claudio', 'Stefano', 'Michele', 'Nicola', 'Emanuele', 'Giacomo', 'Tommaso', 'Pietro',
      'Daniele', 'Edoardo', 'Gianmarco', 'Fabio', 'Massimiliano', 'Enrico', 'Vittorio', 'Giorgio', 'Carmelo', 'Salvatore',
      'Vincenzo', 'Pasquale', 'Ciro', 'Gennaro', 'Alfonso', 'Enzo', 'Luigi', 'Franco', 'Piero', 'Renzo',
      'Dario', 'Mirko', 'Kristian', 'Alessio', 'Ivan', 'Manuel', 'Kevin', 'Omar', 'Samuele', 'Nicolò'
    ],
    last: [
      'Rossi', 'Ferrari', 'Russo', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno',
      'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri',
      'Fontana', 'Santoro', 'Marini', 'Rinaldi', 'Caruso', 'Esposito', 'De Santis', 'Ferrara', 'Amato', 'Riva',
      'Fabbri', 'Cattaneo', 'Marchetti', 'Benedetti', 'Grassi', 'Monti', 'Sala', 'Villa', 'Longo', 'Vitale',
      'Serra', 'Palermo', 'Gatti', 'Donati', 'Mele', 'Ruggiero', 'Silvestri', 'Neri', 'Poli', 'Ferretti'
    ]
  },
  Germany: {
    first: [
      'Lukas', 'Maximilian', 'Leon', 'Florian', 'Jonas', 'Niklas', 'Julian', 'Tobias', 'Sebastian', 'Felix',
      'Moritz', 'Fabian', 'Marco', 'Philipp', 'Christian', 'Patrick', 'Dominik', 'Jan', 'Simon', 'Finn',
      'Tim', 'Erik', 'Lars', 'Kai', 'Tom', 'Ben', 'Noah', 'Paul', 'Elias', 'Lenz',
      'Hannes', 'Timo', 'Nico', 'Marc', 'Sven', 'Dirk', 'Uwe', 'Bernd', 'Klaus', 'Werner',
      'Jürgen', 'Horst', 'Günter', 'Dieter', 'Wolfgang', 'Rolf', 'Heinz', 'Ulf', 'Ralf', 'Carsten'
    ],
    last: [
      'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
      'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Zimmermann', 'Braun',
      'Krüger', 'Hartmann', 'Lange', 'Krause', 'Möller', 'Vogel', 'Fuchs', 'Roth', 'Keller', 'Günther',
      'Arnold', 'Franke', 'Albrecht', 'Winter', 'Bergmann', 'Otto', 'Seidel', 'Graf', 'Ziegler', 'Haas',
      'Scholz', 'Pfeiffer', 'Herrmann', 'Reinhardt', 'Böhm', 'Langer', 'Kunze', 'Horn', 'Brandt', 'Voigt'
    ]
  },
  France: {
    first: [
      'Antoine', 'Lucas', 'Hugo', 'Thomas', 'Théo', 'Axel', 'Sacha', 'Nathan', 'Baptiste', 'Quentin',
      'Romain', 'Julien', 'Nicolas', 'Alexandre', 'Maxime', 'Pierre', 'Guillaume', 'Florian', 'Clément', 'Dylan',
      'Karim', 'Moussa', 'Mamadou', 'Ibrahima', 'Youssef', 'Mehdi', 'Sofiane', 'Bilal', 'Nassim', 'Yanis',
      'Amine', 'Rayan', 'Kylian', 'Eddy', 'Loïc', 'Gaëtan', 'Rémi', 'Yoann', 'Kévin', 'Sébastien',
      'Benoît', 'Laurent', 'Christophe', 'Franck', 'Stéphane', 'Pascal', 'Éric', 'Patrice', 'Thierry', 'Didier'
    ],
    last: [
      'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent',
      'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morin', 'Fournier', 'Girard',
      'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau', 'Garnier', 'Chevalier', 'Blanc', 'Guérin', 'Caron',
      'Renard', 'Faure', 'Marchand', 'Nguyen', 'Diallo', 'Traoré', 'Koné', 'Touré', 'Diarra', 'Sissoko',
      'Camara', 'Coulibaly', 'Mbaye', 'Dembélé', 'Konaté', 'Ouédraogo', 'Sanogo', 'Keïta', 'Bamba', 'Kouyaté'
    ]
  },
  Netherlands: {
    first: [
      'Daan', 'Sem', 'Tim', 'Thijs', 'Bas', 'Ruben', 'Jesse', 'Stef', 'Niels', 'Lars',
      'Joost', 'Bram', 'Sander', 'Wouter', 'Pieter', 'Jeroen', 'Maarten', 'Koen', 'Arjan', 'Niek',
      'Finn', 'Remi', 'Timo', 'Lenny', 'Quincy', 'Virgil', 'Denzel', 'Jurgen', 'Stefan', 'Mitchell',
      'Daley', 'Georginio', 'Riechedly', 'Jetro', 'Cody', 'Tijjani', 'Teun', 'Marten', 'Ryan', 'Nathan',
      'Kevin', 'Donyell', 'Myron', 'Xavi', 'Zian', 'Brian', 'Anwar', 'Oussama', 'Ilias'
    ],
    last: [
      'de Jong', 'Janssen', 'Bakker', 'Visser', 'Smit', 'Meijer', 'de Vries', 'Peters', 'Mulder', 'Hendriks',
      'Dekker', 'Brouwer', 'Kok', 'Lammers', 'Hoekstra', 'Koopmans', 'Dijkstra', 'Vermeer', 'Bos', 'Claassen',
      'Willems', 'van Dijk', 'Kuipers', 'Bosman', 'Nooijer', 'Tol', 'Plas', 'Veerman', 'Clasie', 'Wijnaldum',
      'Promes', 'Babel', 'Robben', 'Sneijder', 'van Persie', 'Huntelaar', 'Kuyt', 'Heitinga', 'Mathijsen', 'Stekelenburg',
      'Vorm', 'Cilessen', 'Flekken', 'Krul', 'Bijlow', 'Vermeer', 'Zoet', 'Olij', 'Drommel'
    ]
  },
  Belgium: {
    first: [
      'Thomas', 'Axel', 'Loïc', 'Yannick', 'Rémi', 'Mathieu', 'Nicolas', 'Sébastien', 'Kevin', 'Timothy',
      'Leander', 'Siebe', 'Pieter', 'Robbe', 'Lasse', 'Hannes', 'Tibo', 'Wout', 'Yorick', 'Dries',
      'Nacer', 'Dedryck', 'Mousa', 'Youri', 'Leandro', 'Alexis', 'Dante', 'Orel', 'Charles', 'Amadou',
      'Elias', 'Bilal', 'Aster', 'Bryan', 'Dodi', 'Zinho', 'Théo', 'Adnan', 'Zakaria', 'Sambi'
    ],
    last: [
      'Peeters', 'Janssen', 'Maes', 'Jacobs', 'Mertens', 'Claes', 'Desmet', 'Goossens', 'Hermans', 'Willems',
      'Martens', 'Dubois', 'De Backer', 'Nijs', 'Vermeersch', 'Bogaert', 'De Cock', 'Dumont', 'Lecomte', 'Renard',
      'Charlier', 'Pirard', 'Bodart', 'Hendrickx', 'Maréchal', 'Collignon', 'Witsel', 'Hazard', 'Kompany', 'Fellaini',
      'Lukaku', 'Courtois', 'Vertonghen', 'Alderweireld', 'Denayer', 'Boyata', 'Meunier', 'Castagne', 'Tielemans', 'Chadli',
      'Dembélé', 'Origi', 'Benteke', 'Batshuayi', 'Michy', 'Praet', 'Verschaeren', 'Mangala', 'Bornauw'
    ]
  },
  Portugal: {
    first: [
      'João', 'Rui', 'Tiago', 'Nuno', 'André', 'Fábio', 'Ricardo', 'Diogo', 'Bruno', 'Marco',
      'Sérgio', 'Miguel', 'Pedro', 'Gonçalo', 'Hélder', 'Luís', 'Vasco', 'Filipe', 'Dinis', 'Tomás',
      'Rodrigo', 'Eduardo', 'Rafael', 'Hugo', 'Renato', 'Vitinha', 'Chico', 'Zé', 'Palhinha', 'Rúben',
      'Domingos', 'Adão', 'Beto', 'Paulinho', 'Rafa', 'Jota', 'Jotinha', 'Trincão', 'Leão', 'Ferro',
      'Dalot', 'Cancelo', 'Guerreiro', 'Neto', 'Pepe', 'Fonte', 'Coates'
    ],
    last: [
      'Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Jesus', 'Sousa',
      'Fernandes', 'Gonçalves', 'Lopes', 'Marques', 'Alves', 'Carvalho', 'Pinto', 'Teixeira', 'Moreira', 'Correia',
      'Mendes', 'Neves', 'Barbosa', 'Cardoso', 'Figueiredo', 'Patrício', 'Beto', 'Rui', 'Moutinho', 'Dantas',
      'Tavares', 'Semedo', 'Vieira', 'Horta', 'Conceição', 'Leite', 'Veiga', 'Trincão', 'Jota', 'Ramos',
      'Banza', 'Doak', 'Diogo', 'Esgaio', 'Evanilson', 'Galeno', 'Namaso', 'Pepê', 'Samu', 'Yaremchuk'
    ]
  },
  Brazil: {
    first: [
      'Gabriel', 'Mateus', 'Lucas', 'Rafael', 'Gustavo', 'Felipe', 'Thiago', 'Eduardo', 'Leonardo', 'Rodrigo',
      'Anderson', 'Douglas', 'Everton', 'Willian', 'Renan', 'Caio', 'Murilo', 'Wesley', 'Victor', 'Henrique',
      'Igor', 'Guilherme', 'Bruno', 'Yuri', 'Matheus', 'Danilo', 'Emerson', 'Alex', 'Marquinhos', 'Militão',
      'Beraldo', 'Arana', 'Wendell', 'Sidnei', 'Telles', 'Dodo', 'Vanderson', 'Yan', 'Weverton', 'Alisson',
      'Ederson', 'Laércio', 'Cleiton', 'Bento', 'Léo'
    ],
    last: [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Carvalho', 'Ferreira', 'Rodrigues', 'Almeida',
      'Nascimento', 'Costa', 'Gomes', 'Martins', 'Araújo', 'Melo', 'Barbosa', 'Ribeiro', 'Cavalcante', 'Mendes',
      'Rocha', 'Freitas', 'Cardoso', 'Moura', 'Batista', 'Lopes', 'Campos', 'Moreira', 'Pinheiro', 'Andrade',
      'Correia', 'Ramos', 'Dias', 'Castro', 'Macedo', 'Teixeira', 'Cunha', 'Farias', 'Monteiro', 'Nunes',
      'Pires', 'Tavares', 'Vieira', 'Xavier', 'Azevedo', 'Borges', 'Duarte', 'Marques', 'Reis', 'Sampaio'
    ],
    isStyle: 'Brazil-Style'
  },
  Argentina: {
    first: [
      'Nicolás', 'Matías', 'Sebastián', 'Ezequiel', 'Facundo', 'Leandro', 'Agustín', 'Maximiliano', 'Franco', 'Germán',
      'Cristian', 'Nahuel', 'Emiliano', 'Ramiro', 'Gonzalo', 'Diego', 'Pablo', 'Alejandro', 'Iván', 'Santiago',
      'Hernán', 'Marcelo', 'Federico', 'Lionel', 'Ángel', 'Lautaro', 'Julián', 'Alexis', 'Rodrigo', 'Lisandro',
      'Marcos', 'Exequiel', 'Valentín', 'Thiago', 'Adolfo', 'Roberto', 'Guido', 'Dante', 'Claudio', 'Ricardo'
    ],
    last: [
      'González', 'Rodríguez', 'García', 'López', 'Martínez', 'Sánchez', 'Romero', 'Torres', 'Díaz', 'Morales',
      'Pérez', 'Fernández', 'Suárez', 'Molina', 'Castro', 'Herrera', 'Medina', 'Álvarez', 'Gutiérrez', 'Pereyra',
      'Acosta', 'Villalba', 'Cabrera', 'Ramos', 'Flores', 'Giménez', 'Otamendi', 'Tagliafico', 'Montiel', 'Foyth',
      'Pezzella', 'Quarta', 'Lisandro', 'Marcos', 'Nahuel', 'Valentín', 'Exequiel', 'Thiago', 'Claudio', 'Adolfo',
      'Guido', 'Leandro', 'Cristian', 'Pablo', 'Gonzalo', 'Germán', 'Franco', 'Facundo', 'Ezequiel', 'Agustín'
    ]
  },
  'United States': {
    first: [
      'Tyler', 'Brandon', 'Kyle', 'Justin', 'Cody', 'Zach', 'Josh', 'Austin', 'Dylan', 'Cameron',
      'Ryan', 'Jordan', 'Tanner', 'Connor', 'Ethan', 'Chase', 'Blake', 'Bryce', 'Logan', 'Caleb',
      'Dillon', 'Marcus', 'DeShawn', 'Malik', 'Tyrone', 'Jamal', 'Darnell', 'Chris', 'Michael', 'Kevin',
      'Weston', 'Giovanni', 'Sergino', 'Yunus', 'Folarin', 'Tim', 'Brad', 'Landon', 'DaMarcus', 'Freddy',
      'Clint', 'Jozy', 'Aron', 'Gyasi', 'Christian', 'Antonee', 'Joe', 'Zack', 'Matt'
    ],
    last: [
      'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson',
      'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark',
      'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright',
      'Turner', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker',
      'Carter', 'Mitchell', 'Perez', 'Roberts', 'Taylor', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards'
    ]
  },
  USA: {
    first: [
      'Tyler', 'Brandon', 'Kyle', 'Justin', 'Cody', 'Zach', 'Josh', 'Austin', 'Dylan', 'Cameron',
      'Ryan', 'Jordan', 'Tanner', 'Connor', 'Ethan', 'Chase', 'Blake', 'Bryce', 'Logan', 'Caleb',
      'Dillon', 'Marcus', 'DeShawn', 'Malik', 'Tyrone', 'Jamal', 'Darnell', 'Chris', 'Michael', 'Kevin',
      'Weston', 'Giovanni', 'Sergino', 'Yunus', 'Folarin', 'Tim', 'Brad', 'Landon', 'DaMarcus', 'Freddy',
      'Clint', 'Jozy', 'Aron', 'Gyasi', 'Christian', 'Antonee', 'Joe', 'Zack', 'Matt'
    ],
    last: [
      'Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson',
      'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark',
      'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright',
      'Turner', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker',
      'Carter', 'Mitchell', 'Perez', 'Roberts', 'Taylor', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards'
    ]
  },
  'Saudi Arabia': {
    first: [
      'Mohammed', 'Abdullah', 'Khalid', 'Faisal', 'Sultan', 'Abdulrahman', 'Nawaf', 'Turki', 'Saud', 'Omar',
      'Hassan', 'Ali', 'Hamad', 'Tariq', 'Majid', 'Walid', 'Saad', 'Nasser', 'Yousef', 'Ahmed',
      'Fahad', 'Mansour', 'Saleh', 'Ibrahim', 'Rayan', 'Hattan', 'Sami', 'Ziyad', 'Karim', 'Marwan',
      'Yasir', 'Loay', 'Riyadh', 'Ayman', 'Badr', 'Talal', 'Azzam', 'Yahya', 'Mabrouk', 'Mishal'
    ],
    last: [
      'Al-Shahrani', 'Al-Dawsari', 'Al-Faraj', 'Al-Muwallad', 'Al-Qahtani', 'Al-Harbi', 'Al-Otaibi', 'Al-Ghamdi', 'Al-Shehri', 'Al-Dosari',
      'Al-Rashidi', 'Al-Mutairi', 'Al-Hamdan', 'Al-Zahrani', 'Al-Malki', 'Al-Asmari', 'Al-Bishi', 'Al-Yami', 'Al-Qarni', 'Al-Anazi',
      'Al-Abdulaziz', 'Al-Khaldi', 'Al-Shahri', 'Al-Naji', 'Al-Mousa', 'Al-Zahid', 'Al-Rubaie', 'Al-Saiari', 'Al-Mayouf', 'Al-Amri',
      'Al-Subaie', 'Al-Numr', 'Al-Khaibari', 'Al-Saleh', 'Al-Abdullrahman', 'Al-Buraikan', 'Al-Ghaddaf', 'Al-Juwayr', 'Al-Najdi', 'Al-Hazmi'
    ]
  },
  Japan: {
    first: [
      'Ryota', 'Daichi', 'Takuma', 'Shoya', 'Keito', 'Yuki', 'Hiroki', 'Kento', 'Naoki', 'Sota',
      'Haruki', 'Riku', 'Hayato', 'Kaito', 'Sho', 'Taisei', 'Ren', 'Yuto', 'Kazuki', 'Tatsuya',
      'Masato', 'Yusei', 'Kohei', 'Daisuke', 'Tomoki', 'Ritsu', 'Takefusa', 'Junya', 'Wataru', 'Ao',
      'Ayase', 'Hidemasa', 'Ko', 'Gaku', 'Mao', 'Shuto', 'Yuya', 'Kenji', 'Takashi', 'Shinji',
      'Shunsuke', 'Makoto', 'Junichi', 'Yasuhito', 'Keisuke', 'Yoichiro', 'Shinji', 'Koji', 'Kengo', 'Atsuto'
    ],
    last: [
      'Tanaka', 'Suzuki', 'Sato', 'Yamamoto', 'Watanabe', 'Kobayashi', 'Ito', 'Kato', 'Nakamura', 'Hayashi',
      'Matsumoto', 'Inoue', 'Kimura', 'Shimizu', 'Ogawa', 'Saito', 'Fujita', 'Nishimura', 'Hashimoto', 'Okamoto',
      'Abe', 'Maeda', 'Nakajima', 'Fujii', 'Sakamoto', 'Morioka', 'Kubo', 'Kamada', 'Endo', 'Ueda',
      'Mitoma', 'Tomiyasu', 'Osako', 'Onaiwu', 'Furuhashi', 'Ideguchi', 'Hatate', 'Oh', 'Machida', 'Yamaguchi',
      'Takagi', 'Morishima', 'Sugawara', 'Nakayama', 'Iwata', 'Okoye', 'Ito', 'Minamino', 'Soma', 'Kawabe'
    ]
  },
  Nigeria: {
    first: [
      'Chukwuemeka', 'Oluwaseun', 'Adebayo', 'Emeka', 'Chibueze', 'Onyekachi', 'Ifeanyi', 'Obinna', 'Nnamdi', 'Chidi',
      'Uche', 'Eze', 'Ikenna', 'Chidera', 'Tochukwu', 'Olumide', 'Segun', 'Gbenga', 'Rotimi', 'Babatunde',
      'Abiodun', 'Kehinde', 'Taiwo', 'Oluwafemi', 'Damilola', 'Yemi', 'Tunde', 'Bode', 'Kelechi', 'Odion',
      'Ahmed', 'Abdullahi', 'Musa', 'Ibrahim', 'Suleiman', 'Aliyu', 'Umar', 'Rabiu', 'Sadiq', 'Yakubu',
      'Victor', 'Sunday', 'Monday', 'Emmanuel', 'Blessing', 'Gift', 'Prince', 'Bright', 'Destiny', 'Chukwudi'
    ],
    last: [
      'Okonkwo', 'Eze', 'Nwosu', 'Obi', 'Chukwu', 'Okeke', 'Nwachukwu', 'Okafor', 'Onwudiwe', 'Igwe',
      'Adeyemi', 'Oladele', 'Bakare', 'Fashola', 'Adesanya', 'Adeola', 'Olawale', 'Ogundimu', 'Fagbemi', 'Musa',
      'Abdullahi', 'Abubakar', 'Garba', 'Tanko', 'Bello', 'Danjuma', 'Lawan', 'Ighalo', 'Iheanacho', 'Ndidi',
      'Onyekuru', 'Onuachu', 'Awoniyi', 'Balogun', 'Aribo', 'Chukwueze', 'Bassey', 'Boniface', 'Lookman', 'Troost-Ekong',
      'Ekong', 'Omeruo', 'Nwakali', 'Etebo', 'Oghenekaro', 'Nwofor', 'Osimhen', 'Agbo', 'Onyedika'
    ]
  },
  Ghana: {
    first: [
      'Kwame', 'Kofi', 'Yaw', 'Kweku', 'Kojo', 'Kwabena', 'Akwasi', 'Kwesi', 'Nii', 'Nana',
      'Sefa', 'Baffour', 'Atta', 'Fiifi', 'Kobby', 'Kweku', 'Elikem', 'Dela', 'Selorm', 'Edem',
      'Kodzo', 'Kafui', 'Seyram', 'Xorse', 'Kekeli', 'Senyo', 'Mawuli', 'Delali', 'Prosper', 'Emmanuel',
      'Solomon', 'Daniel', 'Bernard', 'Richard', 'Prince', 'Andrews', 'Isaac', 'Samuel', 'Thomas', 'Osei'
    ],
    last: [
      'Mensah', 'Boateng', 'Asante', 'Appiah', 'Asamoah', 'Owusu', 'Agyemang', 'Osei', 'Frimpong', 'Acheampong',
      'Ofori', 'Antwi', 'Sarpong', 'Agyei', 'Ankrah', 'Darko', 'Tetteh', 'Quaye', 'Laryea', 'Djiku',
      'Amartey', 'Ayew', 'Sulemana', 'Kudus', 'Partey', 'Semenyo', 'Fatawu', 'Caleb', 'Kyereh', 'Atanga',
      'Benson', 'Paintsil', 'Opoku', 'Owusu-Agyemang', 'Forson', 'Nketiah', 'Lamptey', 'Acquah', 'Gyimah', 'Adomah'
    ]
  },
  'Ivory Coast': {
    first: [
      'Didier', 'Wilfried', 'Nicolas', 'Serge', 'Franck', 'Salomon', 'Emmanuel', 'Gnegneri', 'Gervais', 'Lacina',
      'Jonathan', 'Eric', 'Ismaël', 'Sébastien', 'Romaric', 'Cheick', 'Abdallah', 'Oumar', 'Siaka', 'Arouna',
      'Tiémoué', 'Jean-Philippe', 'Amad', 'Simon', 'Ibrahim', 'Dié', 'Franck', 'Maxwel', 'Arnaud', 'Souleymane',
      'Adama', 'Gbané', 'Lassine', 'Karim', 'Hamza', 'Mory', 'Malick', 'Seydou', 'Brahima', 'Aboubakar'
    ],
    last: [
      'Touré', 'Kalou', 'Koné', 'Traoré', 'Dié', 'Bamba', 'Konaté', 'Camara', 'Coulibaly', 'Bakayoko',
      'Sanogo', 'Diallo', 'Gbamin', 'Doumbia', 'Gradel', 'Cissé', 'Bailly', 'Diomandé', 'Seri', 'Aké',
      'Péléa', 'Fofana', 'Kessié', 'Zaha', 'Boly', 'Lassana', 'Sylla', 'Diabaté', 'Sawaneh', 'Dao',
      'Ouattara', 'Djourou', 'Drogba', 'Dehi', 'Koïta', 'Gbane', 'Niangbo', 'Tiehi', 'Bile', 'Wague'
    ]
  },
  Norway: {
    first: [
      'Erling', 'Martin', 'Alexander', 'Andreas', 'Sander', 'Ole', 'Ola', 'Lars', 'Magnus', 'Kristoffer',
      'Bjørn', 'Petter', 'Vegard', 'Håkon', 'Torbjørn', 'Trond', 'Knut', 'Rune', 'Espen', 'Geir',
      'Steffen', 'Morten', 'Thomas', 'Jens', 'Christian', 'Nicolai', 'Fredrik', 'Henrik', 'Markus', 'Emil',
      'Eirik', 'Stian', 'Jostein', 'Stig', 'Tor', 'Vidar', 'Frode', 'Asbjørn', 'Terje', 'Per'
    ],
    last: [
      'Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen', 'Jensen', 'Karlsen',
      'Johnsen', 'Pettersen', 'Eriksen', 'Berg', 'Haugen', 'Haaland', 'Ødegaard', 'Solberg', 'Berge', 'Thorsby',
      'Ajer', 'Ostigård', 'Elyounoussi', 'Sørloth', 'Strand', 'Nyland', 'Ryerson', 'Bjørnstad', 'Dæhli', 'Normann',
      'Helland', 'Breitenmoser', 'Hestad', 'Mostrom', 'Zinckernagel', 'Konradsen', 'Yndestad', 'Holmen', 'Boniface', 'Strandberg'
    ]
  },
  Sweden: {
    first: [
      'Viktor', 'Marcus', 'Alexander', 'Emil', 'Oscar', 'Isak', 'Sebastian', 'Mattias', 'Christoffer', 'Johan',
      'Erik', 'Jonas', 'Karl', 'Andreas', 'Daniel', 'Pontus', 'Mikael', 'Henrik', 'Sven', 'Jan',
      'Gunnar', 'Björn', 'Lars', 'Nils', 'Gustav', 'Axel', 'Albin', 'Robin', 'Ludwig', 'Linus',
      'Elliot', 'Hugo', 'Felix', 'Simon', 'William', 'Rasmus', 'David', 'Filip', 'Jesper', 'Tobias'
    ],
    last: [
      'Svensson', 'Johansson', 'Andersson', 'Nilsson', 'Eriksson', 'Larsson', 'Persson', 'Lindström', 'Gustafsson', 'Karlsson',
      'Magnusson', 'Lindqvist', 'Bergström', 'Olsson', 'Henriksson', 'Danielsson', 'Jansson', 'Forsberg', 'Ekdal', 'Claesson',
      'Lindelöf', 'Krafth', 'Augustinsson', 'Hiljemark', 'Quaison', 'Isak', 'Kulusevski', 'Elanga', 'Gyökeres', 'Almqvist',
      'Rohden', 'Tibbling', 'Kujovic', 'Erlingmark', 'Darbo', 'Ahl', 'Strandberg', 'Bengtsson', 'Olofsson', 'Fransson'
    ]
  },
  Poland: {
    first: [
      'Piotr', 'Tomasz', 'Michał', 'Jakub', 'Paweł', 'Marcin', 'Kamil', 'Maciej', 'Przemysław', 'Łukasz',
      'Robert', 'Grzegorz', 'Rafał', 'Arkadiusz', 'Wojciech', 'Adam', 'Jan', 'Bartosz', 'Szymon', 'Damian',
      'Krzysztof', 'Sebastian', 'Mateusz', 'Mariusz', 'Radosław', 'Jacek', 'Karol', 'Dawid', 'Filip', 'Marek',
      'Kacper', 'Oskar', 'Konrad', 'Patryk', 'Hubert', 'Dominik', 'Norbert', 'Dariusz', 'Zbigniew', 'Leszek'
    ],
    last: [
      'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak', 'Dąbrowski',
      'Kozłowski', 'Jankowski', 'Mazur', 'Wojciechowski', 'Kwiatkowski', 'Krawczyk', 'Grabowski', 'Nowakowski', 'Pawlak', 'Linetty',
      'Grosicki', 'Piszczek', 'Wietecha', 'Krychowiak', 'Rybus', 'Bereszyński', 'Milik', 'Bielik', 'Frankowski', 'Buksa',
      'Kiwior', 'Zalewski', 'Bednarek', 'Skóraś', 'Struski', 'Sobociński', 'Gumny', 'Puchacz', 'Szymański', 'Moder'
    ]
  },
  Egypt: {
    first: [
      'Mohamed', 'Ahmed', 'Mahmoud', 'Karim', 'Omar', 'Hassan', 'Amr', 'Tarek', 'Marwan', 'Walid',
      'Hossam', 'Islam', 'Mostafa', 'Ramadan', 'Essam', 'Emad', 'Ayman', 'Sherif', 'Wael', 'Alaa',
      'Akram', 'Zaki', 'Saad', 'Ali', 'Trezeguet', 'Shikabala', 'Ramy', 'Fathy', 'Abdalla', 'Hamdi',
      'Nasser', 'Yasser', 'Adel', 'Hosny', 'Mido', 'Sayed', 'Khaled', 'Hazem', 'Ammar', 'Tamer'
    ],
    last: [
      'El-Hadary', 'El-Shenawy', 'El-Sayed', 'El-Nenny', 'Hegazi', 'Fathy', 'Gamal', 'Sobhi', 'Ramadan', 'El-Mohamady',
      'Awad', 'Elneny', 'Warda', 'Mostafa', 'Ashraf', 'Kahraba', 'Hamdy', 'Khattab', 'Aboutrika', 'Zidan',
      'Bakr', 'Hassan', 'Abdel-Shafy', 'El-Shaarawy', 'Kouka', 'El-Wensh', 'Salah', 'El-Badry', 'Trezeguet', 'Ashour',
      'Shikabala', 'Nouh', 'Basyoni', 'El-Solia', 'Gomaa', 'El-Kabir', 'Hany', 'Diaa', 'Moustafa', 'Abou Ali'
    ]
  },
  Morocco: {
    first: [
      'Hakim', 'Achraf', 'Sofyan', 'Nayef', 'Noussair', 'Youssef', 'Azzedine', 'Brahim', 'Ilias', 'Yassine',
      'Amine', 'Soufiane', 'Mehdi', 'Abdelhamid', 'Selim', 'Walid', 'Zakaria', 'Ayoub', 'Bilal', 'Tarik',
      'Abderrahmane', 'Hicham', 'Khalid', 'Karim', 'Jawad', 'Amir', 'Reda', 'Hamza', 'Romain', 'Anass',
      'Adil', 'Saad', 'Jawad', 'Fayçal', 'Nabil', 'Badr', 'Mounir', 'Rachid', 'Simo', 'Aymen'
    ],
    last: [
      'Ziyech', 'Hakimi', 'Amrabat', 'Aguerd', 'Mazraoui', 'En-Nesyri', 'Ounahi', 'Boufal', 'Sabiri', 'Saiss',
      'Benoun', 'Attiyat-Allah', 'El Yamiq', 'Bono', 'Bounou', 'Harit', 'Benrahma', 'Slimani', 'El Kaabi', 'Tissoudali',
      'Aboukhlal', 'El Ouazzani', 'Ezzalzouli', 'Iajour', 'Dari', 'Hariss', 'Rahimi', 'Belghali', 'Zenata',
      'Tagnaouti', 'Khallati', 'El Khannous', 'Zaroury', 'Dellal', 'Louza', 'Zerrouki', 'Onaiwu', 'Hajji', 'Benkaid', 'Ahdal'
    ]
  },
  'South Korea': {
    first: [
      'Heung-Min', 'Jae-Sung', 'Sung-Yueng', 'Chan-Ho', 'Min-Jae', 'Seung-Ho', 'Hyun-Jun', 'In-Beom', 'Woo-Young', 'Young-Gwon',
      'Tae-Hwan', 'Ju-Ho', 'Kyung-Rock', 'Do-Hoon', 'Chun-Soo', 'Ji-Sung', 'Young-Pyo', 'Dong-Gook', 'Chang-Hoon', 'Kang-In',
      'Hee-Chan', 'Gue-Sung', 'Jun-Ho', 'Ui-Jo', 'Jae-Hyun', 'Sang-Ho', 'Min-Gyu', 'Tae-Seok', 'Jun-Sik', 'Hyun-Soo'
    ],
    last: [
      'Son', 'Kim', 'Park', 'Lee', 'Choi', 'Jung', 'Kang', 'Cho', 'Hwang', 'Oh', 'Yun', 'Lim',
      'Jang', 'Kwon', 'Han', 'Moon', 'Yang', 'Bae', 'Na', 'Shin', 'Baek', 'Ryu', 'Ahn', 'Ko',
      'Song', 'Seol', 'Ki', 'Jeong', 'Hong', 'Seo', 'Yoo', 'Byun', 'Goo', 'Eom', 'Jeon', 'Sim',
      'Noh', 'Heo', 'Gi', 'Cha'
    ]
  },
  Senegal: {
    first: [
      'Sadio', 'Kalidou', 'Édouard', 'Idrissa', 'Cheikhou', 'Ismaila', 'Bamba', 'Famara', 'Moussa', 'Mamadou',
      'Cheikh', 'Papa', 'Pape', 'Abdou', 'Saliou', 'Abdoulaye', 'Lamine', 'Assane', 'Nicolas', 'Krépin',
      'Formose', 'Ibrahima', 'Pathé', 'Alfred', 'Fodé', 'Habib', 'Samba', 'Oumar', 'Bouna', 'Amadou',
      'Aliou', 'Souleymane', 'Malick', 'Diao', 'Seydou', 'Khalidou', 'Demba', 'Mbaye', 'Mor', 'Sidy'
    ],
    last: [
      'Mané', 'Koulibaly', 'Mendy', 'Gueye', 'Kouyaté', 'Sarr', 'Diedhiou', 'Diallo', 'Sow', 'Diop',
      'Niang', 'Ba', 'Fall', 'Mbaye', 'Niakhate', 'Sabaly', 'Jakobs', 'Ciss', 'Diatta', 'Faye',
      'Diouf', 'Toure', 'Camara', 'Thiam', 'Badji', 'Traoré', 'Ndiaye', 'Sylla', 'Konaté', 'Sembène',
      'Baldé', 'Cissé', 'Wague', 'Gomis', 'Saio', 'Keïta', 'Coulibaly', 'Kébé', 'Sané', 'Wagué'
    ]
  },
  Australia: {
    first: [
      'Mathew', 'Jamie', 'Aaron', 'Tom', 'Bailey', 'Riley', 'Jackson', 'Josh', 'Mark', 'Chris',
      'Mitchell', 'Harry', 'Ryan', 'Scott', 'Adam', 'Craig', 'Brett', 'Shane', 'Kevin', 'Graham',
      'Andy', 'Archie', 'Garang', 'Jason', 'Aziz', 'Trent', 'Danny', 'Massimo', 'Marco', 'Dylan',
      'Lachlan', 'Cameron', 'Callum', 'Jesse', 'Rhyan', 'Patrick', 'Nicholas', 'Connor', 'Brandon', 'James'
    ],
    last: [
      'Ryan', 'Leckie', 'Behich', 'Souttar', 'Atkinson', 'Hrustic', 'Irvine', 'Degenek', 'Wright', 'MacLaren',
      'Grant', 'Boyle', 'Rogic', 'Milligan', 'Wilkinson', 'Neill', 'Schwarzer', 'Bresciano', 'Kennedy', 'Troisi',
      'Jedinak', 'Spiranovic', 'Davidson', 'Devlin', 'Martin', 'Smith', 'Williams', 'Brown', 'Taylor', 'Wilson',
      'Thompson', 'White', 'Harris', 'Walker', 'Anderson', 'Robinson', 'Hall', 'Moore', 'Allen', 'Young'
    ]
  }
};
