package com.campus.parttime.application;

import com.campus.parttime.common.Result;
import java.util.Map;

public interface ApplicationService {

    Result<?> apply(Long studentId, Map<String, Object> body);

    Result<?> getMyApplications(Long userId);

    Result<?> withdraw(Long id, Long userId);

    Result<?> getReceived(Long userId);

    Result<?> handle(Long id, Integer status);
}