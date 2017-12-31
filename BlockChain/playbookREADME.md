To debug/develop

	Go code
		Copy all go code to some path, in Root/src/<your code files> format
		Also have hyperledger stuff in same path in Root/src/github/hyperledger/<git clone of hyperledger fabric>
		export GOPATH=$PWD
		from Root run 'go build  <your code files>
	Faster debugging of node code
		go to web/
		npm install
		npm run build
		npm run serve

		Now the node does not know how to talk to all containers (ip, name), so run a proxy dns container like so 	docker run --hostname dns.mageddo --name dns-proxy-server -p 5380:5380 \
-v /var/run/docker.sock:/var/run/docker.sock \
-v /etc/resolv.conf:/etc/resolv.conf \
defreitas/dns-proxy-server
		In your docker-compose, add hostname:(same as container name) line
		Also, change name in peer.base (this is generic, for some reason that is not the name of the network being built)
		Restart all containers
		Also run npm stuff from same window, a lot of env variables are set

		
	
