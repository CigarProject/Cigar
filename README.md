![Protocol](https://img.shields.io/badge/protocol-5-orange.svg)

# Cigar
An unofficial Agar.io client used to run with Ogar based servers. Allows you to connect to an Ogar based server and have the abilities of the new protocol in a smaller and cleaner client.

## Obtaining and Using
Due to parts of Cigar require the use of PHP, you will need to have a web environment with PHP for parts to work. So the project will have to be installed on a webserver or localhost.

You will need a webserver capable of running PHP only, also it cannot be run off file:// due to cross-origin blocks.

### Now using Protocol 5
This version of the client is using the new-ish protocol 5. Now supporting larger maps sizes and many different upgrades. As well, you can now use hidden skin setting with the angled brackets, if the server supports it.

## Recommended Servers
This client can be used with any server that is built with the same protocol and connect with it properly. However, the recommended server that we are building for and works best with Cigar to get all the features out of it with is [MultiOgar-Edited](https://github.com/Megabyte918/MultiOgar-Edited).

## Configuring Cigar
### Adding More Server Dropdowns
The connection method on Cigar works through the function of 

```javascript
setserver("IP:PORT"); 
```

To add another server, you can call any element that has the main_out.js called to run the function and the server will change within the canvas. To add another dropdown that will switch to your server, add the following line inside of the existing dropdown box.

```html
<option value="IP:PORT">NAME</option>
```

Replace IP:PORT with the ones that are corresponding with your server, you can also change the NAME to anything you like.

### Changing Skins Folder
The skins folder can be changed to any folder that is located on your web server. If you wish to move the skins folder onto another domain, please do note that the checkdir.php file might stop working and that will break skins from showing up in game. To change the skin folder on the set webserver, you will need to update 2 files. Open /assets/js/main_out.js and edit the following line:

```javascript
SKIN_URL = "./skins/"; // Skin Directory
```

Update the ./skins/ to the directory that the skins folder is located in. You can also back out into directories out of where the main_out.js is being called from by using /../ for each directory.

You also need to update one line inside of the checkdir.php file:

```php
$images = glob('./skins/*.{png}', GLOB_BRACE);
```

Update the part where it says ./skins/, however make sure not remove *.{png} because without that the skins will not load anymore. (Also, make sure all the skin files are .png!)

## Support
You can get support from the community and developers by adding issues or suggestions in the issues tab at this repository. However please do note, **if you remove the backlink to Cigar on your project, we will NOT provide support for your website.**

## Contributing
Please see [CONTRIBUTING.md](https://github.com/CigarProject/Cigar/blob/master/CONTRIBUTING.md) for contribution guidelines.

## License
Please see [LICENSE.md](https://github.com/CigarProject/Cigar/blob/master/LICENSE.md).
