/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    "options": {
      "includeOnly": "^src/",
      "reporterOptions": {
        "dot": {
          "theme": {
            "graph": {
              "splines": "ortho"
            },
            "modules": [
              {
                "criteria": { "source": "^src/components/Chessboard/" },
                "attributes": {
                  "fillcolor": "#4DB6AC"
                }
              },
              {
                "criteria": { "source": "^src/components/FreeBoard/" },
                "attributes": {
                  "fillcolor": "#7986CB"
                }
              },
              {
                "criteria": { "source": "^src/components/Room/" },
                "attributes": {
                  "fillcolor": "#64B5F6"
                }
              },
              {
                "criteria": { "source": "^src/components/MultiplayerGame/" },
                "attributes": {
                  "fillcolor": "#9575CD"
                }
              },
              {
                "criteria": { "source": "^src/components/Home/" },
                "attributes": {
                  "fillcolor": "#E57373"
                }
              },
              {
                "criteria": { "source": "^src/components/Navbar/" },
                "attributes": {
                  "fillcolor": "#F06292"
                }
              },
              {
                "criteria": { "source": "^src/components/Profile/" },
                "attributes": {
                  "fillcolor": "#BA68C8"
                }
              },
              {
                "criteria": { "source": "^src/components/CreateRoom/" },
                "attributes": {
                  "fillcolor": "#FFD54F"
                }
              },
              {
                "criteria": { "source": "^src/components/CreateGame/" },
                "attributes": {
                  "fillcolor": "#FF8A65"
                }
              },
              {
                "criteria": { "source": "^src/components/ComputerGame/" },
                "attributes": {
                  "fillcolor": "#A1887F"
                }
              },
              {
                "criteria": { "source": "^src/components/Signin/" },
                "attributes": {
                  "fillcolor": "#81C784"
                }
              },
              {
                "criteria": { "source": "^src/components/Signup/" },
                "attributes": {
                  "fillcolor": "#DCE775"
                }
              }
            ]
          }
        }
      }
    }
  };