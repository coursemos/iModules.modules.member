<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원 구조체를 정의한다.
 *
 * @file /modules/member/dto/Member.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 4. 10.
 */
namespace modules\member\dto;
class Member
{
    /**
     * @var object $_member 회원정보
     */
    private object $_member;

    /**
     * @var int $_id 회원고유값
     */
    private int $_id;

    /**
     * 회원 구조체를 정의한다.
     *
     * @param object $member 회원정보
     */
    public function __construct(?object $member = null)
    {
        /**
         * 비회원인 경우
         */
        if ($member == null) {
            $member = new \stdClass();
            $member->member_id = 0;
        }

        $this->_member = $member;
        $this->_id = intval($member->member_id);
    }

    /**
     * 고유값을 가져온다.
     *
     * @return int $id
     */
    public function getId(): int
    {
        return $this->_id;
    }

    /**
     * 회원사진 URL을 가져온다.
     *
     * @return string $url
     */
    public function getPhotoUrl(): string
    {
        return \Configs::dir() . '/members/' . $this->_id . '/photo.jpg';
    }

    /**
     * 회원사진을 가져온다.
     *
     * @param bool $is_html_tag HTML 태그로 가져올지 여부 (false 인 경우 사진 URL 만 가져온다.)
     * @return string $_photo
     */
    public function getPhoto(bool $is_html_tag = true): string
    {
        if (isset($this->_photo) == false) {
            $this->_photo = 'abcd.jpg';
        }

        if ($is_html_tag == true) {
            return \Html::element(
                'i',
                [
                    'data-module' => 'member',
                    'data-role' => 'photo',
                    'style' => 'background-image(' . $this->_photo . ')',
                ],
                $this->getDisplayName(false)
            );
        }

        return $this->_photo;
    }

    /**
     * 사이트설정에 따라 표시될 회원이름을 가져온다.
     *
     * @param bool $is_nickcon 닉이미지가 존재할 경우 닉이미지를 가져올지 여부 (기본값 true)
     * @param string $force 가져올 이름종류 (realname : 실명, nickname : 닉네임, NULL 인 경우 사이트설정)
     * @return string $display_name
     */
    public function getDisplayName(bool $is_nickcon = true, ?string $force = null): string
    {
        return '아무개';
    }

    /**
     * 현재 사용자가 회원인지 확인한다.
     *
     * @return bool $is_member
     */
    public function isMember(): bool
    {
        return $this->_id !== 0;
    }
}
