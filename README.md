# Upwell Structure Monitor
An online tool for monitoring your EvE Online - Upwell structures</br>
Free to use </br>
*(publicly available; but should I start to see people overloading the system, I'll turn on whitelist)* </br>

https://upwell-monitor.ludvigaman.se </br>

You're also free to host it yourself, please check the "Set-up" in the Wiki.
</br></br>
The application has a front-end built in Angular TypeScript, and a backend written in .NET 6.
All data and tokens are stored client-side only.
</br>The ESI.NET wrapper is provided by the wonderful contributors at Seraphx2, and their github can be found here: </br>
https://github.com/seraphx2/ESI.NET
# Upcoming releases
- v1.2
</br>Added an error page for users that are not directors.
</br>Added strict CORS policy to the backend to prevent misuse.
</br>Added station services
</br>Added statistics page to display total infrastructure consumption

# Release notes
- v1.1
</br>Added the option for the user to change the "target" fuel level in days. Found under settings.

- v1.0
</br>Initial release.

# Planned features
- POS monitoring somehow?

# Keep in mind
- This tool can only be used if you're a Director for your corporation, since it requires the permissions to read the corporation assets.
- It's built to run on a Windows environment, IIS in my case.
- All icons and EvE related logotypes are the property of CCP Games (EvE Online), and are used in accordance to their license agreement. </br>
You can <b>NOT</b> use this application if your aiming to charge for it, or use it in commercial purposes.

# Preview

Landing page:
![Landing page](https://i.imgur.com/zwYLXTI.png)

Overview:
![Overview](https://i.imgur.com/R8H8jPF.png)

Whitelist error:
![Whitelist error](https://i.imgur.com/PWYEtZ3.png)

Loading page:
![Loading page](https://i.imgur.com/2gZFSWR.png)

# Set-up
Find more in the Wiki section!
