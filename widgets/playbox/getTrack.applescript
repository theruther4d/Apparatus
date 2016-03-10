global aname, tname, alname, stardisplay, rate
property blackStar : "★"
property whiteStar : "☆"

set musicapp to item 1 of my appCheck()
set playerstate to item 2 of my appCheck()
set defaultResponse to "NA" & " ~ " & "NA" & " ~ " & "NA" & " ~ " & "NA" & " ~ " & "NA" & " ~ " & "NA" & " ~ " & "NA"

--return playerstate

try
	if musicapp is not "" then
		if playerstate is not "Paused" then
			if musicapp is "iTunes" then
				tell application "iTunes"
					set {tname, aname, alname, rate, tduration} to {name, artist, album, rating, duration} of current track
					set tpos to player position
				end tell
			else if musicapp is "Spotify" then
				tell application "Spotify"
					set {tname, aname, alname, rate, tduration} to {name, artist, album, popularity, duration} of current track
					set tpos to my replace(player position as string, ".", "")
				end tell
			end if
			set stardisplay to my rating(rate)
			return aname & " ~ " & tname & " ~ " & alname & " ~ " & stardisplay & " ~ " & tduration & " ~ " & tpos & " ~ " & musicapp
		else
			return defaultResponse
		end if
	else
		return defaultResponse
	end if
on error e
	my logEvent(e)
	return defaultResponse
end try

on appCheck()
	set apps to {"iTunes", "Spotify"}
	set playerstate to {}
	set activeApp to {}
	repeat with i in apps
		tell application "System Events" to set state to (name of processes) contains i
		if state is true then
			set activeApp to (i as string)
			try
				using terms from application "iTunes"
					tell application i
						if player state is playing then
							set playerstate to "Playing"
							exit repeat
						else
							set playerstate to "Paused"
							--exit repeat
						end if
					end tell
				end using terms from
			end try
		else
			set activeApp to ""
		end if
	end repeat
	return {activeApp, playerstate}
end appCheck

on rating(rate)
	set stars to (rate div 20)
	if rate is greater than 0 and stars is equal to 0 then
		set stars to 1
	end if
	set stardisplay to "" as Unicode text
	repeat with i from 1 to stars
		set stardisplay to stardisplay & blackStar
	end repeat
	repeat with i from stars to 4
		set stardisplay to stardisplay & whiteStar
	end repeat
	return stardisplay
end rating

on replace(this_text, search_string, replacement_string)
	set AppleScript's text item delimiters to search_string
	set the item_list to every text item of this_text
	set AppleScript's text item delimiters to replacement_string
	set this_text to the item_list as string
	set AppleScript's text item delimiters to ""
	return this_text
end replace

on logEvent(e)
	do shell script "echo '" & (current date) & ": Found " & e & "' >> ~/Library/Logs/Playbox-Widget.log"
end logEvent
