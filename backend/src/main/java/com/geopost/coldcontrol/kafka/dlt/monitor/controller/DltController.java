package com.geopost.coldcontrol.kafka.dlt.monitor.controller;

import com.geopost.coldcontrol.kafka.dlt.monitor.dto.ErrorTypeDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.dto.MessageDTO;
import com.geopost.coldcontrol.kafka.dlt.monitor.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DltController {

    private final MessageService messageService;

    @GetMapping("/errorTypes")
    public ResponseEntity<List<ErrorTypeDTO>> getErrorTypes() {
        List<ErrorTypeDTO> errorTypes = messageService.findErrorTypes();
        return ResponseEntity.ok(errorTypes);
    }

    @GetMapping("/messages")
    public ResponseEntity<Page<MessageDTO>> search(
            @RequestParam Map<String, String> filters,
            @PageableDefault(size = 100)
            @SortDefault.SortDefaults({
                    @SortDefault(sort = "timestamp", direction = Sort.Direction.ASC)
            }) Pageable pageable
    ) {
        Page<MessageDTO> result = messageService.findMessages(filters, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/messages/{id}")
    public ResponseEntity<MessageDTO> getMessage(@PathVariable String id) {
        return messageService.findMessageById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/messages")
    public ResponseEntity<Boolean> deleteMessages(@RequestBody List<String> ids) {
        return ResponseEntity.ok(messageService.deleteMessageByIds(ids));
    }

}
