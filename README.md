## Available Scripts

In the project directory, you can run:

### `npm run dev`

## TODO

- aggiungi controllo se il tempo è scaduto lato server
- gestione del punteggio ELO dei giocatori a fine partita

BUG:
- bisogna controllare che una mossa che è stata eseguita dal giocatore sia effettivamente una mossa che può fare altrimenti il giocatore di colore nero potrebbe in qualche maniera riuscire a far eseguire mosse per contro del giocatore bianco, inoltre bisogna anche controllare lato server che la mossa eseguita sia valida e nel caso non lo sia gestire
- se uno dei due giocatori esce dalla partita senza chiudere il browser è considerato come pausing del webosocket quindi esso non viene chiuso e pertanto non viene considerata chiusa la partita