FROM ghcr.io/dhhyi/dcc-devcontainer-javascript

RUN mkdir -p "/" && echo "Iy9iaW4vc2gKc2V0IC1lCmVjaG8gInNldHRpbmcgdXAgbm9kZV9tb2R1bGVzIHZvbHVtZSIKaWYgWyAteiAiJDEiIF07IHRoZW4KICBlY2hvICJubyB3b3Jrc3BhY2UgYXJndW1lbnQgcHJvdmlkZWQhIgogIGV4aXQgMQpmaQplY2hvICJzdG9yZS1kaXI9JDEvbm9kZV9tb2R1bGVzLy5zdG9yZSIgPiAkSE9NRS8ubnBtcmMKc3VkbyBjaG93biAkVVNFUiBub2RlX21vZHVsZXMK" | base64 -d > "/setup-node-modules.sh" && chmod +rx "/setup-node-modules.sh"

USER vscode
