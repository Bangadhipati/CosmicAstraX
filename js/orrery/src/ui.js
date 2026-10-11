import * as ORR from "./init.js";
import * as TWEEN from "../../tween/tween.esm.js";
import $ from "../../jquery/jquery.module.js";

const planetScale = { f: 1.0 };
const planetMoons = []; // moons of the the currently focused planet


function windowResize() { // window setup and resize handler
    ORR.renderer.setSize(window.innerWidth, window.innerHeight);
    ORR.renderer.setPixelRatio(window.devicePixelRatio);
    ORR.camera.aspect = window.innerWidth / window.innerHeight;
    ORR.camera.updateProjectionMatrix();
    ORR.bloomComposer.setSize(window.innerWidth, window.innerHeight);
    ORR.finalComposer.setSize(window.innerWidth, window.innerHeight);
    ORR.center.x = window.innerWidth * 0.5;
    ORR.center.y = window.innerHeight * 0.5;
    placeWidgets();
}
window.addEventListener('resize', windowResize);
windowResize();

window.addEventListener('mousemove', onMouseMove);
function onMouseMove(e) {
    ORR.state.mousePos.x = e.clientX;
    ORR.state.mousePos.y = e.clientY;
}

function pauseResume() {
    if (ORR.times.speed == ORR.times.pauseRate) { // resume
        ORR.times.speed = ORR.times.lastSpeed;
    } else { // pause but remeber previous speed
        ORR.times.lastSpeed = ORR.times.speed;
        ORR.times.speed = ORR.times.pauseRate;
    }
    ORR.times.rate = ORR.rates[ORR.times.speed];
}

document.addEventListener("keyup", function (event) { // keystroke handler
    switch (event.code) {
        case "ArrowLeft":
            ORR.slowTime();
            break;
        case "ArrowRight":
            ORR.speedTime();
            break;
        case "ArrowDown":
            ORR.setTime(ORR.unixToMJD(Date.now()));
            break;
        case "Space":
            document.activeElement.blur();
            pauseResume();
            break;
        case "Escape": // unclick clicked tag
            if (ORR.state.clickedLabel != "") {
                closeTag(ORR.state.clickedLabel);
            }
            break;
        case "ArrowUp":
            zoomToggle();
            break;
        case "F2":
            $("#inputBox").toggle(300);
            break;
        case "F4":
            $(".gratLabel").toggle();
            ORR.cameraLocked.graticule.visible = !ORR.cameraLocked.graticule.visible;
            break;
        case "F8":
            $(".extraData").toggle();
            ORR.state.extraData = !ORR.state.extraData;
            break;
    }
    ORR.times.rate = ORR.rates[ORR.times.speed]; // apply speed changes
});

/**
 * Handle tag clicks.
 * @param {number} t - System ID 
 */
export function clickTag(t) {
    if ($('#' + t).length < 1) {
        ORR.makeLabel(t);
    }
    $("#minimized-panel").hide();
    ORR.state.clickedLabel = $('#' + t);
    ORR.state.clickedLabel.addClass("active").show();
    if ($.isEmptyObject(ORR.state.lastClickedPlanet) == false) {
        ORR.paths[ORR.state.clickedPlanet.path].material = ORR.pathMaterials[Math.min(ORR.state.lastClickedPlanet.type, 3)];
    }
    // Dim all other orbits
    ORR.setPathMaterials(ORR.state.orbitOpacity * 0.15);
    ORR.state.clickedPlanet = ORR.system[t];
    
    // Set selected orbit color based on type
    if (ORR.state.clickedPlanet.type === 0) {
        ORR.selectedPathMat.color.setHex(0xff3333); // Red for planets
    } else {
        ORR.selectedPathMat.color.setHex(0xffd700); // Golden for non-planets
    }
    
    ORR.paths[ORR.state.clickedPlanet.path].material = ORR.selectedPathMat;
    if (ORR.system[t].type > 3) {
        ORR.scene.add(ORR.paths[ORR.state.clickedPlanet.path]);
    }
    $("#distToActive").remove();
    ORR.state.lastClickedPlanet = ORR.state.clickedPlanet;
    ORR.controls.minDistance = 0.1;
    const tweenTo = new TWEEN.Tween(ORR.controls.target)
        .to({ x: ORR.state.clickedPlanet.celestialPos.x, y: ORR.state.clickedPlanet.celestialPos.y, z: ORR.state.clickedPlanet.celestialPos.z }, 1000).easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () { this.to({ x: ORR.state.clickedPlanet.celestialPos.x, y: ORR.state.clickedPlanet.celestialPos.y, z: ORR.state.clickedPlanet.celestialPos.z }) })
        .start();

    const viewDistance = Math.max(0.01, ORR.state.clickedPlanet.exagRadius * 2);
    const startCamPos = ORR.camera.position.clone();
    const startTarget = ORR.controls.target.clone();
    let dir = startCamPos.sub(startTarget).normalize();
    if (dir.lengthSq() < 0.1) dir.set(0, 0, 1);

    new TWEEN.Tween(ORR.camera.position)
        .to({
            x: ORR.state.clickedPlanet.celestialPos.x + dir.x * viewDistance,
            y: ORR.state.clickedPlanet.celestialPos.y + dir.y * viewDistance,
            z: ORR.state.clickedPlanet.celestialPos.z + dir.z * viewDistance
        }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function () {
            this.to({
                x: ORR.state.clickedPlanet.celestialPos.x + dir.x * viewDistance,
                y: ORR.state.clickedPlanet.celestialPos.y + dir.y * viewDistance,
                z: ORR.state.clickedPlanet.celestialPos.z + dir.z * viewDistance
            });
        })
        .start();

    const wikiHref = (ORR.state.clickedPlanet.wiki !== "default") ? ORR.state.clickedPlanet.wiki : "#";
    $("#infohead").attr("href", wikiHref);
    $("#info img").parent("a").attr("href", wikiHref);
    if (ORR.state.clickedPlanet.wiki === "default") {
        $("#infohead").removeAttr("target");
        $("#info img").parent("a").removeAttr("target");
    } else {
        $("#infohead").attr("target", "_blank");
        $("#info img").parent("a").attr("target", "_blank");
    }

    $("#infohead").html(ORR.state.clickedLabel[0].innerHTML);
    const imgContainer = $(".wikipic-container");
    imgContainer.hide();
    const imgEl = $("#info img");
    imgEl.hide().removeAttr("src").off("error").on("error", function () { 
        $(this).hide(); 
        imgContainer.hide();
    });

    if (ORR.state.clickedPlanet.wiki !== "default" && ORR.state.clickedPlanet.wiki.includes("wikipedia.org/wiki/")) {
        const wikiTitle = ORR.state.clickedPlanet.wiki.split("/wiki/").pop();
        const apiUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=" + wikiTitle + "&prop=pageimages&format=json&pithumbsize=400&redirects=1&origin=*";

        $.getJSON(apiUrl, function (data) {
            try {
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId !== "-1" && pages[pageId].thumbnail) {
                    imgEl.attr("src", pages[pageId].thumbnail.source).show();
                    imgContainer.fadeIn(300);
                } else if (ORR.state.clickedPlanet.wikipic !== "default") {
                    imgEl.attr("src", ORR.state.clickedPlanet.wikipic).show();
                    imgContainer.fadeIn(300);
                }
            } catch (e) {
                if (ORR.state.clickedPlanet.wikipic !== "default") {
                    imgEl.attr("src", ORR.state.clickedPlanet.wikipic).show();
                    imgContainer.fadeIn(300);
                }
            }
        }).fail(function () {
            if (ORR.state.clickedPlanet.wikipic !== "default") {
                imgEl.attr("src", ORR.state.clickedPlanet.wikipic).show();
                imgContainer.fadeIn(300);
            }
        });
    } else if (ORR.state.clickedPlanet.wikipic !== "default") {
        imgEl.attr("src", ORR.state.clickedPlanet.wikipic).show();
        imgContainer.fadeIn(300);
    }
    const planetInfo = ORR.state.clickedPlanet.info;
    let moonInfo = ""
    if (ORR.state.clickedPlanet.moons > 0) {
        moonInfo = '<br><a id="moonZoom">Moons: ' + ORR.state.clickedPlanet.moons + ' (' + ORR.state.clickedPlanet.largestMoon;
        moonInfo += (ORR.state.clickedPlanet.moons > 1) ? ',&nbsp;&nbsp;' + ORR.state.clickedPlanet.secondMoon : '';
        moonInfo += (ORR.state.clickedPlanet.moons > 2) ? ', et al.)</a>' : ')</a>';
    }
    $("#planetInfo").html(planetInfo + moonInfo);
    $("#moonZoom").on("click", function () {
        zoomToggle();
    })
    const adjustedA = (ORR.state.clickedPlanet.semiMajorAxis < 0.1) ? (ORR.state.clickedPlanet.semiMajorAxis * ORR.AU).toFixed(1) + '&nbsp;km' : ORR.state.clickedPlanet.semiMajorAxis.toFixed(4) + '&nbsp;AU';
    $("#semiMajorAxis").html(adjustedA);
    const adjustedP = (ORR.state.clickedPlanet.period < 0.01) ? (ORR.state.clickedPlanet.period * ORR.daysPerCent).toFixed(3) + '&nbsp;days' : (ORR.state.clickedPlanet.period * 100).toFixed(3) + '&nbsp;years'
    $("#period").html(adjustedP);
    $("#eccentricity").html(ORR.state.clickedPlanet.eccentricity.toFixed(3));
    $("#inclination").html((ORR.state.clickedPlanet.inclination * ORR.toDeg).toFixed(2));
    $("#radius").html(parseFloat(ORR.state.clickedPlanet.radius).toFixed(1));
    $("#absMag").html(ORR.state.clickedPlanet.absoluteMag.toFixed(2));
    $("#object-details-modal").addClass("open").removeClass("collapsed");
    $("#info").css("display", "flex");
    if (t == ORR.specialID.earth) {
        $("#earth").show();
    } else {
        $("#earth").hide();
    }
}

/**
 * Unclick a tag.
 * @param {number} t - System ID
 */
export function closeTag(t) {
    t.removeClass("active");

    if (t.hasClass("tag3")) {
        t.removeClass("tag3");
        t.addClass("tag2");
    }
    $("#minimized-panel").hide();
    ORR.state.clickedLabel = "";
    // Restore orbit opacity
    ORR.setPathMaterials(ORR.state.orbitOpacity);
    ORR.paths[ORR.state.clickedPlanet.path].material = ORR.pathMaterials[Math.min(ORR.state.clickedPlanet.type, 3)];
    if (ORR.state.following) {
        zoomOut(ORR.state.lastClickedPlanet.exagRadius / 2000);
    }
    ORR.state.following = false;
    ORR.controls.maxDistance = ORR.initMaxDistance;
    const tweenMin = new TWEEN.Tween(ORR.controls).to({ minDistance: 1 }, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
    const tweenHome = new TWEEN.Tween(ORR.controls.target).to({ x: 0, y: 0, z: 0 }, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();
    $("#object-details-modal").removeClass("open collapsed");
}

function updateScale() {
    for (let i = 0; i < ORR.majorBodies.length; i++) {
        const scaleBody = ORR.scene.children[ORR.majorBodies[i].childId];
        scaleBody.scale.set(planetScale.f, planetScale.f, planetScale.f);
        ORR.sun.scale.set(planetScale.f, planetScale.f, planetScale.f);
    }
}

function zoomIn() {
    if (ORR.state.clickedPlanet.isSun) {
        ORR.controls.minDistance = 0.05;
    } else {
        ORR.controls.minDistance = ORR.state.clickedPlanet.radius / ORR.AU * 100000;
    }
    const tweenPushIn = new TWEEN.Tween(ORR.controls).to({ maxDistance: ORR.initMaxDistance / ORR.state.clickedPlanet.zoomRatio }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut).start();

    const tweenZoomIn = new TWEEN.Tween(ORR.camera).to({ fov: .001 }, 1000)
        .onUpdate(() => ORR.camera.updateProjectionMatrix())
        .easing(TWEEN.Easing.Quadratic.InOut).start();

    const tweenShrink = new TWEEN.Tween(planetScale).to({ f: 1 / ORR.exagScale }, 1000)
        .onUpdate(() => updateScale())
        .onComplete(function () {
            ORR.pointMaterial.size = 0.005;
            if (ORR.state.clickedPlanet.type < 2) {
                ORR.paths[ORR.state.clickedPlanet.path].material = ORR.transparentMaterial;
                for (let i = 0; i < ORR.moons.length; i++) {
                    if (ORR.moons[i].orbitId == ORR.state.clickedPlanet.sysId) {
                        planetMoons.push(ORR.moons[i]);
                        document.getElementById(ORR.moons[i].sysId).style.display = "block";
                        ORR.scene.children[ORR.moons[i].childId].material = ORR.pathMaterials[0];
                    }
                }
            }
        })
        .easing(TWEEN.Easing.Quadratic.InOut).start();
}

function zoomOut() {
    ORR.controls.maxDistance = ORR.initMaxDistance;
    const tweenPushOut = new TWEEN.Tween(ORR.controls).to({ minDistance: ORR.initMinDistance }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut).start();

    const tweenZoomOut = new TWEEN.Tween(ORR.camera).to({ fov: ORR.initialFOV }, 1000)
        .onUpdate(() => ORR.camera.updateProjectionMatrix())
        .easing(TWEEN.Easing.Quadratic.InOut).start();

    const tweenGrow = new TWEEN.Tween(planetScale).to({ f: 1.0 }, 1000)
        .onStart(function () {
            ORR.pointMaterial.size = ORR.initialPoint;
            for (let i = 0; i < ORR.paths.length; i++) {
                ORR.paths[i].material = ORR.paths[i].initMaterial;
            }
        })
        .onUpdate(() => updateScale())
        .easing(TWEEN.Easing.Quadratic.InOut).start();

    for (let i = 0; i < planetMoons.length; i++) {
        document.getElementById(planetMoons[i].sysId).style.display = "none";
    }
    planetMoons.splice(0, planetMoons.length);
}

function zoomToggle() {
    const scaleRadius = ORR.state.clickedPlanet.exagRadius / 2000;
    ORR.state.following = (ORR.state.clickedLabel != "") ? !ORR.state.following : false;
    (ORR.state.following) ? zoomIn(scaleRadius) : zoomOut(scaleRadius);
}

$("#autocomplete").autocomplete({
    minLength: 2,
    source: function (request, response) {
        var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
        response($.grep(ORR.searchLists.combined, function (item) {
            return matcher.test(item);
        }));
    },
    select: function (e, ui) {
        if (ORR.state.clickedLabel != "") {
            closeTag(ORR.state.clickedLabel);
        }
        clickTag(ORR.searchLists.orderedNames.indexOf(ui.item.value));
        this.value = "";
        return false;
    }
});

$(function () {
    // Removed accordion initialization as the UI is now a distributed layout
    placeWidgets();
    $("#button, #input").tooltip();
    
    // Initialize datepicker
    $("#custom-date-input").datepicker({
        dateFormat: "dd-mm-yy",
        changeMonth: true,
        changeYear: true,
        yearRange: "1000:3000",
        showOn: "button",
        buttonText: "",
        beforeShow: function(input, inst) {
            isCalendarOpen = true;
            $("body").addClass("calendar-open");
            $("#set-custom-date").addClass("active selected");
            $("#datepicker-backdrop").stop(true, true).fadeIn(150);
        },
        onClose: function(dateText, inst) {
            closeCustomDatePicker();
        },
        onSelect: function(dateText) {
            closeCustomDatePicker();
            // Trigger logic immediately after selection
            setTimeout(() => {
                const parts = dateText.split("-");
                if (parts.length === 3) {
                    let timeVal = $("#custom-time-input").val().trim();
                    if (!timeVal) timeVal = "12:00:00";
                    const timeParts = timeVal.split(":");
                    let hh = parseInt(timeParts[0] || "12", 10);
                    const mm = (timeParts[1] || "00").toString().padStart(2, '0');
                    const ss = (timeParts[2] || "00").toString().padStart(2, '0');
                    
                    const ampm = $("#am-pm-toggle").text();
                    if (ampm === "PM" && hh < 12) hh += 12;
                    if (ampm === "AM" && hh === 12) hh = 0;
                    
                    const hhStr = hh.toString().padStart(2, '0');

                    const isoString = `${parts[2]}-${parts[1]}-${parts[0]}T${hhStr}:${mm}:${ss}Z`;
                    const parsed = Date.parse(isoString);
                    if (!isNaN(parsed)) {
                        ORR.times.parsedDate = parsed;
                        ORR.setTime(ORR.unixToMJD(parsed));
                        $("#custom-date-input").val(""); 
                        $("#custom-time-input").val("");
                    }
                }
            }, 50);
        }
    });
});

function placeWidgets() {
    // Removed jQuery UI positioning for inputBox as it uses CSS absolute 100% width/height now.
}

function updatePlayPauseIcon() {
    const playSvg = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    const pauseSvg = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    const isPaused = (ORR.times.speed == 7);
    $("#playpause-icon").html(isPaused ? playSvg : pauseSvg);
    const speedLabel = document.querySelector(".speed-label");
    if (speedLabel) {
        speedLabel.textContent = isPaused ? "PAUSED" : "SPEED";
    }
}

$("#reverse").on("click", function () {
    ORR.slowTime();
    updatePlayPauseIcon();
});

$("#forward").on("click", function () {
    ORR.speedTime();
    updatePlayPauseIcon();
});

$("#play").on("click", function () {
    pauseResume();
    updatePlayPauseIcon();
});

$("#now").on("click", function () {
    ORR.setTime(ORR.unixToMJD(Date.now()));
});

$("#planetBox, #moonBox, #asteroidBox, #cometBox, #phaBox").on("click", function () {
    $("#autocomplete")[0].value = "";
    ORR.searchLists.combined = ORR.searchLists.planetNames.concat(
        ($("#moonBox")[0].checked) ? ORR.searchLists.moonNames : null,
        ($("#asteroidBox")[0].checked) ? ORR.searchLists.asteroidNames : null,
        ($("#cometBox")[0].checked) ? ORR.searchLists.cometNames : null);

    updateOrbitsVisibility();
});

function updateOrbitsVisibility() {
    const showPlanets = $("#planetBox")[0].checked;
    const showMoons = $("#moonBox")[0].checked;
    const showAsteroids = $("#asteroidBox")[0].checked;
    const showComets = $("#cometBox")[0].checked;
    const showPHAs = $("#phaBox")[0].checked;

    for (let i = 0; i < ORR.system.length; i++) {
        const body = ORR.system[i];
        let visible = true;

        if (body.type === 0) visible = showPlanets;
        else if (body.orbitId !== undefined) visible = showMoons;
        else if (ORR.searchLists.cometNames.includes(body.name)) visible = showComets;
        else if (ORR.searchLists.asteroidNames.includes(body.name)) {
            if (body.semiMajorAxis < 1.3) visible = showPHAs;
            else visible = showAsteroids;
        }

        if (ORR.paths[body.path]) ORR.paths[body.path].visible = visible;
        if (ORR.scene.children[body.childId]) ORR.scene.children[body.childId].visible = visible;
    }
}

function submitCustomDate() {
    const val = $("#custom-date-input").val().trim();
    if (!val) return;
    
    // allow both / and - as separators
    const parts = val.split(/[/-]/);
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        
        let timeVal = $("#custom-time-input").val().trim();
        if (!timeVal) timeVal = "12:00:00";
        const timeParts = timeVal.split(":");
        let hh = parseInt(timeParts[0] || "12", 10);
        const mm = (timeParts[1] || "00").toString().padStart(2, '0');
        const ss = (timeParts[2] || "00").toString().padStart(2, '0');
        
        const ampm = $("#am-pm-toggle").text();
        if (ampm === "PM" && hh < 12) hh += 12;
        if (ampm === "AM" && hh === 12) hh = 0;
        
        const hhStr = hh.toString().padStart(2, '0');
        
        const isoString = `${year}-${month}-${day}T${hhStr}:${mm}:${ss}Z`;
        const parsed = Date.parse(isoString);
        if (!isNaN(parsed)) {
            ORR.times.parsedDate = parsed;
            ORR.setTime(ORR.unixToMJD(parsed));
            $("#custom-date-input").val(""); 
            $("#custom-time-input").val("");
        }
    }
}

let isCalendarOpen = false;
let lastCalendarToggleTime = 0;

function openCustomDatePicker() {
    isCalendarOpen = true;
    $("body").addClass("calendar-open");
    $("#set-custom-date").addClass("active selected");
    $("#datepicker-backdrop").stop(true, true).fadeIn(150);
    $("#custom-date-input").datepicker("show");
}

function closeCustomDatePicker() {
    isCalendarOpen = false;
    $("body").removeClass("calendar-open");
    $("#set-custom-date").removeClass("active selected");
    $("#datepicker-backdrop").stop(true, true).fadeOut(150);
    $("#custom-date-input").datepicker("hide");
}

function toggleCustomDatePicker(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const now = Date.now();
    if (now - lastCalendarToggleTime < 250) return;
    lastCalendarToggleTime = now;

    if (isCalendarOpen) {
        closeCustomDatePicker();
    } else {
        openCustomDatePicker();
    }
}

// Stop jQuery UI's document mousedown from closing datepicker prematurely when clicking the toggle icon
$("#set-custom-date").on("mousedown touchstart", function (e) {
    e.stopPropagation();
});

$("#set-custom-date").on("click", function (e) {
    toggleCustomDatePicker(e);
});

// If calendar is open, clicking on the manual date entry area (#custom-date-input) closes the calendar
$("#custom-date-input").on("mousedown touchstart", function (e) {
    if (isCalendarOpen) {
        e.stopPropagation();
    }
});

$("#custom-date-input").on("click", function (e) {
    if (isCalendarOpen) {
        e.preventDefault();
        e.stopPropagation();
        closeCustomDatePicker();
        $(this).blur();
    }
});

// Clicking or tapping anywhere outside the calendar (on backdrop) closes the calendar & disables background clicks
$(document).on("click touchstart", "#datepicker-backdrop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    closeCustomDatePicker();
});

// Close calendar on Escape key
$(document).on("keydown", function (e) {
    if (e.key === "Escape" && isCalendarOpen) {
        closeCustomDatePicker();
    }
});

$("#custom-date-input, #custom-time-input").on("keypress", function (e) {
    if (e.which === 13) { // Enter key
        e.preventDefault();
        submitCustomDate();
        closeCustomDatePicker();
    }
});

$("#custom-date-input").on("input", function() {
    let val = $(this).val().replace(/[^\d]/g, '');
    if (val.length > 2) val = val.substring(0, 2) + '-' + val.substring(2);
    if (val.length > 5) val = val.substring(0, 5) + '-' + val.substring(5, 9);
    $(this).val(val);
});

$("#custom-time-input").on("input", function() {
    let val = $(this).val().replace(/[^\d]/g, '');
    let hh = val.substring(0, 2);
    let mm = val.substring(2, 4);
    let ss = val.substring(4, 6);

    if (hh.length === 1 && parseInt(hh, 10) > 1) hh = "0" + hh;
    if (hh.length === 2) {
        if (parseInt(hh, 10) > 12) hh = "12";
        if (parseInt(hh, 10) === 0) hh = "12"; 
    }
    
    if (mm.length === 1 && parseInt(mm, 10) > 5) mm = "0" + mm;
    if (mm.length === 2 && parseInt(mm, 10) > 59) mm = "59";
    
    if (ss.length === 1 && parseInt(ss, 10) > 5) ss = "0" + ss;
    if (ss.length === 2 && parseInt(ss, 10) > 59) ss = "59";

    let finalVal = hh;
    if (val.length > 2) finalVal += ':' + mm;
    if (val.length > 4) finalVal += ':' + ss;
    
    $(this).val(finalVal);
});

$("#am-pm-toggle").on("click", function (e) {
    e.preventDefault();
    const current = $(this).text();
    $(this).text(current === "AM" ? "PM" : "AM");
});

$("#clearSplash").on("click", function () {
    $("#splashScreen").hide(300);
    ORR.state.showSplash = false;
});

$("#toggle-sidebar-btn").on("click", function() {
    const modal = $("#object-details-modal");
    if (modal.hasClass("collapsed")) {
        modal.removeClass("collapsed");
        $(this).find("polyline").attr("points", "9 18 15 12 9 6"); // Right arrow >
    } else {
        modal.addClass("collapsed");
        $(this).find("polyline").attr("points", "15 18 9 12 15 6"); // Left arrow <
    }
});

$("#sidebar-close-btn").on("click", function() {
    if (ORR.state.clickedLabel !== "") {
        closeTag(ORR.state.clickedLabel);
    }
});




$("#openSplash").on("click", function () {
    ORR.state.showSplash = true;
    $("#splashScreen").show(300);
    $("#clearSplash").css({ "visibility": "visible" });
});

$("#slider").slider({
    min: 0,
    max: 100,
    value: 50,
    stop: function (event, ui) {
        ORR.setPathMaterials(ui.value / 100);
        for (let i = 0; i < ORR.system.length; i++) {
            ORR.redraw(i);
        }
    }
});

// Clear accidental text selections across the scene/UI on click/pointerdown
window.addEventListener("pointerdown", function(e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable)) {
        return;
    }
    const selection = window.getSelection ? window.getSelection() : document.selection;
    if (selection) {
        if (selection.empty) {
            selection.empty();
        } else if (selection.removeAllRanges) {
            selection.removeAllRanges();
        }
    }
});