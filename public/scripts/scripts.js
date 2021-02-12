let socialMediaExpanded = false;

$(document).ready(function() {
	// listen to registration form for validity as fields are populated
	$('#fname').change(function() {
	  validateRegistration();
	});

	$('#lname').change(function() {
	  validateRegistration();
	});

	$('#email').change(function() {
	  validateRegistration();
	});

	$('#password').change(function() {
	  validateRegistration();
	});

	$('#confirmpassword').change(function() {
	  validateRegistration();
	});

	$('#addnewproject').click(function() {
		$('#myModal').modal();
	});

	//Listen for clicks on the social media button
	$('#socialMediaParent').on('click', function() {
		if (socialMediaExpanded == false) {
			socialMediaExpanded = true;
			$('#socialMediaLinks').fadeIn("slow")
		} else {
			socialMediaExpanded = false;
			$('#socialMediaLinks').fadeOut("slow");
		}
	})

	// Look for stubbed URLs for in-page navigation
	const anchorlinks = document.querySelectorAll('a[href^="#"]');

	// Iterate through the nodelist to create a listener for each link	
  for (let item of anchorlinks) {
    item.addEventListener('click', (event) => {
	let hashval = item.getAttribute('href');
	let target = document.querySelector(hashval);
	target.scrollIntoView({
		behavior: 'smooth',
		block: 'start',
	})
	history.pushState(null, null, hashval)
	event.preventDefault();
	})
	}
});

function clearFields() {
  // Clear fields on contact form
  document.getElementById('fname').value = '';
  document.getElementById('email').value = '';
  document.getElementById('message').value = '';

  // Thank user for the message
  alert('Thank you for your message.')
}

function validateRegistration() {
	// If passwords match
	if ( $('#password').val() == $('#confirmpassword').val() && $('#password').val() != '') {
		// display submitButton
		$('#submitButton').css({"display":"inherit"});
	} else {
		hideSubmitButton();
	}
}

function hideSubmitButton() {
	$('#submitButton').css({"display":"none"});	
}

// Listen to update schedule page submit button
function validateUpdateScheduleForm(event) {
	const scheduleFormattedData = $('#summernoteSchedule').summernote('code');
	const scheduleEncodedData = encodeURI(scheduleFormattedData);
	$('#ScheduleText').val(scheduleEncodedData);
	return true;
}