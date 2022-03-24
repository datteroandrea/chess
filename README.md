## Available Scripts

In the project directory, you can run:

### `npm run dev`

##COLORS

-Blue:          #4fb4bf
-Green:         #4caf50
-Yellow:        #ffeb3b
-Orange:        #ffa726
-Red:           #ff5f52
-Black1:        #1b1b1b
-Black2:        #272727
-Black3:        #313131
-LightSquare:   #F0D9B5
-DarkSquare:    #B58863

## TODO

- aggiungi campo reason nella collection game che indica il motivo della fine della partita
- gestione del punteggio ELO dei giocatori a fine partita

BUG:
- bisogna controllare che una mossa che è stata eseguita dal giocatore sia effettivamente una mossa legale
    - 2 scenari:
        - siccome il giocatore ha provato ad eseguire operazioni malevole la partita viene considerata persa
        - annulla la mossa al giocatore (più complicato)
- se uno dei due giocatori esce dalla partita senza chiudere il browser è considerato come pausing del websocket quindi esso non viene chiuso e pertanto non viene considerata chiusa la partita

RICORDATI DI ELIMINARE LE API DELETE DI GAMES E ROOMS