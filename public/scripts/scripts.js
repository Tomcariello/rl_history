var socialMediaExpanded = false;

$( document ).ready(function() {

	//Check contact form for contents before submitting
	$('#contactSubmit').on('click',function() {
		
		if ($('#fname').val() != "") {
			$('#fname').removeClass('formWarning');
			if ($('#email').val() != "") {
				$('#email').removeClass('formWarning');
				if ($('#reason').val() != "--") {
					$('#reason').removeClass('formWarning');
					if ($('#message').val() != "") {
						$('#message').removeClass('formWarning');
						return true;
					} else{
						$('#message').addClass('formWarning');
					}
				} else {
					$('#reason').addClass('formWarning');
				}
			} else {
				$('#email').addClass('formWarning');
			}
		} else {
			$('#fname').addClass('formWarning');
		}
			
	return false;
	})

	//listen to registration form for validity as fields are populated
	$("#fname" ).change(function() {
	  validateRegistration();
	});

	$("#lname" ).change(function() {
	  validateRegistration();
	});

	$("#email" ).change(function() {
	  validateRegistration();
	});

	$("#password" ).change(function() {
	  validateRegistration();
	});

	$("#confirmpassword" ).change(function() {
	  validateRegistration();
	});

	$("#addnewproject" ).click(function() {
		$("#myModal").modal();
	});

	//Listen for clicks on the social media button
	$('#socialMediaParent').on('click', function() {
		if (socialMediaExpanded == false) {
			socialMediaExpanded = true;
			$('#socialMediaLinks').fadeIn("slow")
		} else {
			socialMediaExpanded = false;
			$('#socialMediaLinks').fadeOut("slow")
		}
	})

	// Look for stubbed URLs for in-page navigation
	let anchorlinks = document.querySelectorAll('a[href^="#"]')

	// Iterate through the nodelist to create a listener for each link	
	for (let item of anchorlinks) {
		item.addEventListener('click', (event)=> {
			let hashval = item.getAttribute('href');
			let target = document.querySelector(hashval);
			target.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			})
			history.pushState(null, null, hashval)
			event.preventDefault();
		})
	}
	

});



function clearFields() {
  //Clear fields on contact form
  document.getElementById("fname").value = "";
  document.getElementById("email").value = "";
  document.getElementById("message").value = "";

  //Thank user for the message
  alert("Thank you for your message.")

}

function validateRegistration() {

	//Refactor this code
	if ($("#fname" ).val() != "") {
		if ($("#lname" ).val() != "") {
			$("#lname").css({"border-color":"initial"});
			if ($("#email" ).val() != "") {
				$("#email").css({"border-color":"initial"});
				if ($("#password" ).val() != "") {
					$("#password").css({"border-color":"initial"});
					if ($("#password" ).val() == $("#confirmpassword" ).val()) {
						$("#confirmpassword").css({"border-color":"initial"});
						//display submitButton
						$("#submitButton").css({"display":"inherit"});
					} else {
						$("#confirmpassword").css({"border":"1px solid red"});
						hideSubmitButton();
					}
				} else {
					$("#password").css({"border":"1px solid red"});
					hideSubmitButton();
				}
			} else {
				$("#email").css({"border":"1px solid red"});
				hideSubmitButton();
			}
		} else {
			$("#lname").css({"border":"1px solid red"});
			hideSubmitButton();
		}
	} else {
		$("#fname").css({"border":"1px solid red"});
		hideSubmitButton();
	}
}

function hideSubmitButton() {
	$("#submitButton").css({"display":"none"});	
}

//Listen to update schedule page submit button
function validateUpdateScheduleForm(event) {

	var scheduleFormattedData = $('#summernoteSchedule').summernote('code');
	var scheduleEncodedData = encodeURI(scheduleFormattedData);

	$("#ScheduleText").val(scheduleEncodedData);

	return true;
}