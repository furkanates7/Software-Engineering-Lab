package pentacode.backend.code.common.utils;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseHandler {
	public static ResponseEntity<Object> generateListResponse(String message, HttpStatus status, Object responseObj,
			int count) {
        if(responseObj == null){
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("message", message);
            map.put("status", HttpStatus.NOT_FOUND);
            map.put("data", "Not found");
            map.put("code", 404);
            return new ResponseEntity<Object>(map, status);
        }
        else{
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("message", message);
            map.put("status", status.value());
            map.put("code", 200);
            map.put("data", responseObj);
            map.put("Total Character Count", count);
            return new ResponseEntity<Object>(map, status);
        }
	}

    public static ResponseEntity<Object> generatePkResponse(String message, HttpStatus status, Object responseObj) {
        if(responseObj == null){
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("message", message);
            map.put("status", HttpStatus.NOT_FOUND);
            map.put("data", "Not found");
            map.put("code", 404);
            return new ResponseEntity<Object>(map, status);
        }
        else{
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("message", message);
            map.put("status", status.value());
            map.put("code", 200);
            map.put("data", responseObj);
            return new ResponseEntity<Object>(map, status);
        }

    }
}