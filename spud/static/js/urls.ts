/// <reference path="globals.ts" />
/// <reference path="jcookie.ts" />
/// <reference path="generic.ts" />
/*
spud - keep track of photos
Copyright (C) 2008-2013 Brian May

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
"use strict";


// ********
// * URLS *
// ********
function root_url() {
    return window.__root_prefix
}

function static_url(file) {
   return window.__static_prefix + file
}

void static_url

// *********
// * LINKS *
// *********
function object_a(type : string, value : SpudObject) {
    let viewport : Viewport
    let params = {
        obj: null,
        obj_id: value.id,
    }

    if (type === "albums") {
        viewport = new AlbumDetailViewport(params)
    }
    else if (type === "categorys") {
        viewport = new CategoryDetailViewport(params)
    }
    else if (type === "places") {
        viewport = new PlaceDetailViewport(params)
    }
    else if (type === "persons") {
        viewport = new PersonDetailViewport(params)
    }
    else if (type === "photos") {
        viewport = new PhotoDetailViewport(params)
    }
    else {
        return null;
    }
    var a = $('<a/>')
        .attr('href', root_url() + type + "/" + value.id + "/")
        .on('click', function () {
            add_viewport(viewport)
            return false;
        })
        .data('photo', value.cover_photo)
        .text(value.title);
    return a;
}

function photo_a(photo) {
    return object_a("photos", photo)
}

void photo_a


// ***************
// * AJAX COMMON *
// ***************
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            var token = $.jCookie("csrftoken")
            xhr.setRequestHeader("X-CSRFToken", token);
        }
    }
});


interface SuccessCallback {
    (data : Streamable): void
}

interface ErrorCallback {
    (message : string, data : Streamable): void
}

function ajax(settings : JQueryAjaxSettings,
              success : SuccessCallback,
              error : ErrorCallback) : JQueryXHR {
    settings = $.extend({
        dataType: 'json',
        cache: false,
    }, settings)

    if (settings.type != null && settings.type !== "GET") {
        settings.data = JSON.stringify(settings.data)
        settings.contentType = 'application/json; charset=UTF-8'
    }

    var xhr : JQueryXHR = $.ajax(settings)

    xhr
        .done(
            (data : Streamable, textStatus : string, jqXHR : JQueryXHR) => {
                success(data)
            }
        )
        .fail(
            function(jqXHR : JQueryXHR, textStatus : string, errorThrown : string) {
                if (textStatus === "abort") {
                    return
                }
                if (jqXHR.responseJSON != null) {
                    var message = jqXHR.responseJSON.detail
                    if (message == null) {
                        message = errorThrown
                    }
                    error(message, jqXHR.responseJSON)
                } else {
                    error(jqXHR.status + " " + errorThrown, null)
                }
            }
        )

    return xhr
}
